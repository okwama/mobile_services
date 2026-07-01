import { Injectable, NotFoundException, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Payment, PaymentStatus, PaymentMethod } from '../../entities/payment.entity';
import { TransactionLedger, TransactionType, TransactionStatus, PaymentProvider as LedgerProvider, Currency } from '../../entities/transaction-ledger.entity';
import { CompanyPaymentAccount, PaymentProvider, AccountStatus } from '../../entities/company-payment-account.entity';
import { PaystackService } from './paystack.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(TransactionLedger)
    private ledgerRepository: Repository<TransactionLedger>,
    @InjectRepository(CompanyPaymentAccount)
    private accountRepository: Repository<CompanyPaymentAccount>,
    @Inject('BOOKING_SERVICE') private bookingService: ClientProxy,
    @Inject('COMMUNICATION_SERVICE') private commsService: ClientProxy,
    private paystackService: PaystackService,
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize payment with Paystack (Simplified - No Commission)
   */
  private mapPreferredMethodToChannels(preferredPaymentMethod?: string): string[] | undefined {
    switch (preferredPaymentMethod) {
      case 'card': return ['card'];
      case 'mpesa':
      case 'mobile_money': return ['mobile_money'];
      case 'bank_transfer': return ['bank_transfer'];
      case 'ussd': return ['ussd'];
      case 'bank': return ['bank'];
      case 'eft': return ['eft'];
      default: return undefined; // Paystack shows all enabled channels
    }
  }

  async initializePayment(data: {
    bookingId: string;
    amount: number;
    userId: string;
    companyId: number;
    email: string;
    currency?: string;
    preferredPaymentMethod?: string;
  }) {
    try {
      this.logger.log(`Initializing payment for booking: ${data.bookingId}`);

      // All payments settle to the platform's main Paystack account.
      // Per-company subaccount splits are disabled until payout logic is ready.
      const enforcedCurrency = (data.currency || 'KES').toUpperCase();
      const paystackResponse = await this.paystackService.initializeTransaction({
        amount: data.amount,
        email: data.email,
        currency: enforcedCurrency,
        bookingId: data.bookingId,
        userId: data.userId,
        companyId: data.companyId,
        channels: this.mapPreferredMethodToChannels(data.preferredPaymentMethod),
        metadata: {
          bookingId: data.bookingId,
          userId: data.userId,
          companyId: data.companyId,
        },
      });

      // Create payment record
      const payment = this.paymentRepository.create({
        id: paystackResponse.reference,
        bookingId: data.bookingId,
        booking_id: data.bookingId,
        userId: data.userId,
        company_id: data.companyId,
        paymentMethod: PaymentMethod.PAYSTACK,
        payment_method: PaymentMethod.PAYSTACK,
        totalAmount: data.amount,
        platformFee: 0, // No commission tracking for now
        platform_fee: 0,
        companyAmount: data.amount, // Company gets full amount
        company_amount: data.amount,
        currency: data.currency || 'KES',
        transactionId: paystackResponse.reference,
        transaction_id: paystackResponse.reference,
        paymentStatus: PaymentStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      });

      await this.paymentRepository.save(payment);

      // Create transaction ledger entry
      await this.createLedgerEntry({
        transactionId: paystackResponse.reference,
        companyId: data.companyId,
        userId: data.userId,
        bookingId: parseInt(data.bookingId),
        transactionType: TransactionType.PAYMENT_RECEIVED,
        paymentProvider: LedgerProvider.PAYSTACK,
        amount: data.amount,
        currency: Currency.KES,
        description: `Payment for booking ${data.bookingId}`,
        metadata: JSON.stringify(paystackResponse),
      });

      this.logger.log(`Payment initialized successfully: ${paystackResponse.reference}`);

      return {
        success: true,
        paymentUrl: paystackResponse.authorization_url,
        reference: paystackResponse.reference,
        accessCode: paystackResponse.access_code,
      };

    } catch (error) {
      this.logger.error(`Payment initialization failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(reference: string) {
    try {
      this.logger.log(`Verifying payment: ${reference}`);

      const verification = await this.paystackService.verifyTransaction(reference);

      // Update payment status
      await this.paymentRepository.update(
        { transactionId: reference },
        {
          paymentStatus: verification.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          payment_status: verification.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          paymentGatewayResponse: JSON.stringify(verification),
          payment_gateway_response: JSON.stringify(verification),
        }
      );

      // Update ledger
      await this.ledgerRepository.update(
        { transactionId: reference },
        {
          status: verification.status === 'success' ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
          providerTransactionId: verification.reference,
          providerMetadata: JSON.stringify(verification),
          processedAt: new Date(),
        }
      );

      // If successful, update booking (no commission tracking)
      if (verification.status === 'success') {
        const payment = await this.paymentRepository.findOne({
          where: { transactionId: reference },
        });

        if (payment) {
          // Update booking's payment status via booking-service
          try {
            await this.bookingService.send(
              { cmd: 'update_payment_status' },
              { id: parseInt(payment.bookingId), paymentStatus: 'paid' }
            ).toPromise();
            this.logger.log(`Updated payment status for booking ${payment.bookingId}`);
            } catch (e) {
            this.logger.warn(`Failed to update payment status for ${payment.bookingId}: ${getErrorMessage(e)}`);
          }

          // Emit payment completed event
          this.commsService.emit('payment.completed', {
            bookingId: payment.bookingId,
            paymentId: payment.id,
            amount: payment.totalAmount,
            currency: payment.currency,
            userId: payment.userId,
            referenceNumber: reference, // Add for notification
          });

          this.logger.log(`Payment completed successfully for booking ${payment.bookingId}`);
        }
      }

      return {
        success: verification.status === 'success',
        status: verification.status,
        amount: verification.amount / 100,
        reference: verification.reference,
      };

    } catch (error) {
      this.logger.error(`Payment verification failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async handleWebhook(data: any) {
    this.logger.log(`Webhook received: ${data.event}`);
    
    if (data.event === 'charge.success') {
      await this.verifyPayment(data.data.reference);
    }
  }

  /**
   * Process Paystack webhook with signature verification
   */
  async processWebhook(payload: { signature: string; body: any }) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      this.logger.error('PAYSTACK_SECRET_KEY not configured');
      throw new UnauthorizedException('Payment configuration missing');
    }

    const computed = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload.body))
      .digest('hex');

    if (computed !== payload.signature) {
      this.logger.warn('Invalid Paystack webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    await this.handleWebhook(payload.body);
    return { success: true };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async processRefund(paymentId: string, reason?: string) {
    const payment = await this.findOne(paymentId);
    
    // Process refund with Paystack
    const refund = await this.paystackService.refundTransaction(payment.transactionId);

    // Update payment status
    payment.paymentStatus = PaymentStatus.REFUNDED;
    payment.payment_status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);

    return { success: true, refund };
  }

  private async createLedgerEntry(data: Partial<TransactionLedger>) {
    const ledger = this.ledgerRepository.create({
      ...data,
      exchangeRate: 1.0,
      baseAmount: data.amount,
      netAmount: data.amount,
      status: TransactionStatus.PENDING,
    });

    return this.ledgerRepository.save(ledger);
  }
}

