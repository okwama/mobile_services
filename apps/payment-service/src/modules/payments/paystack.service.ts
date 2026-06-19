import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Paystack from 'paystack';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private paystack: any;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY not configured');
    } else {
      this.paystack = Paystack(secretKey);
      this.logger.log('Paystack initialized successfully');
    }
  }

  /**
   * Initialize Paystack transaction
   */
  async initializeTransaction(data: {
    amount: number;
    email: string;
    currency: string;
    bookingId: string;
    userId: string;
    companyId: number;
    subaccountCode?: string;
    metadata?: any;
  }) {
    try {
      this.logger.log(`Initializing Paystack transaction for booking ${data.bookingId}`);

      const transactionData: any = {
        amount: Math.round(data.amount * 100), // Convert to kobo
        email: data.email,
        currency: data.currency,
        reference: this.generateReference(data.bookingId),
        callback_url: `${process.env.APP_URL || 'http://localhost:5008'}/api/payments/paystack/callback`,
        metadata: {
          bookingId: data.bookingId,
          userId: data.userId,
          companyId: data.companyId,
          ...data.metadata,
        },
      };

      // Add subaccount if provided (for automatic splits)
      if (data.subaccountCode) {
        transactionData.subaccount = data.subaccountCode;
        this.logger.log(`Using Paystack subaccount: ${data.subaccountCode}`);
      }

      const response = await this.paystack.transaction.initialize(transactionData);

      if (!response.status) {
        throw new Error(`Paystack initialization failed: ${response.message}`);
      }

      this.logger.log(`Paystack transaction initialized: ${response.data.reference}`);

      return {
        success: true,
        reference: response.data.reference,
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
      };

    } catch (error) {
      this.logger.error(`Paystack initialization error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Paystack transaction
   */
  async verifyTransaction(reference: string) {
    try {
      this.logger.log(`Verifying Paystack transaction: ${reference}`);

      const response = await this.paystack.transaction.verify(reference);

      if (!response.status) {
        throw new Error(`Paystack verification failed: ${response.message}`);
      }

      this.logger.log(`Paystack verification result: ${response.data.status}`);

      return response.data;

    } catch (error) {
      this.logger.error(`Paystack verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refund Paystack transaction
   */
  async refundTransaction(reference: string) {
    try {
      this.logger.log(`Refunding Paystack transaction: ${reference}`);

      const response = await this.paystack.refund.create({
        transaction: reference,
      });

      if (!response.status) {
        throw new Error(`Paystack refund failed: ${response.message}`);
      }

      return response.data;

    } catch (error) {
      this.logger.error(`Paystack refund error: ${error.message}`);
      throw error;
    }
  }

  private generateReference(bookingId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PAYSTACK_${bookingId}_${timestamp}_${random}`.toUpperCase();
  }
}

