import { Controller, Post, Get, Body, Param, Inject, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentService: ClientProxy,
  ) {}

  // Paystack-specific endpoints (match Flutter's expected routes)
  @Post('paystack/initialize')
  @ApiOperation({ summary: 'Initialize Paystack payment' })
  async initializePaystackPayment(@Body() body: {
    bookingId: string;
    amount: number;
    userId: string;
    companyId: number;
    email: string;
    currency?: string;
    description?: string;
    preferredPaymentMethod?: string;
    metadata?: any;
  }) {
    const result = await firstValueFrom(
      this.paymentService.send({ cmd: 'initialize_payment' }, body),
    );
    return { success: true, data: result };
  }

  @Get('paystack/verify/:reference')
  @ApiOperation({ summary: 'Verify Paystack payment' })
  async verifyPaystackPayment(@Param('reference') reference: string) {
    const result = await firstValueFrom(
      this.paymentService.send({ cmd: 'verify_payment' }, { reference }),
    );
    return { success: true, data: result };
  }

  // Legacy endpoints (keep for backward compatibility)
  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment (legacy)' })
  async initializePayment(@Body() body: any) {
    return this.initializePaystackPayment(body);
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify payment (legacy)' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.verifyPaystackPayment(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(@Param('id') id: string) {
    return firstValueFrom(
      this.paymentService.send({ cmd: 'get_payment' }, { id }),
    );
  }

  @Post('refund')
  @ApiOperation({ summary: 'Process refund' })
  async processRefund(@Body() body: { paymentId: string; reason?: string }) {
    return firstValueFrom(
      this.paymentService.send({ cmd: 'process_refund' }, body),
    );
  }

  @Post('paystack/callback')
  @ApiOperation({ summary: 'Paystack callback endpoint (after payment)' })
  async paystackCallback(@Body() body: any) {
    // This is called when user is redirected after payment
    // Redirect to app with payment status
    return {
      success: true,
      message: 'Payment processed. Please check your app.',
      reference: body.reference,
    };
  }

  @Post('paystack/webhook')
  @ApiOperation({ summary: 'Paystack webhook endpoint (server-to-server)' })
  async paystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
  ) {
    // Forward to payment service for signature verification and processing
    return firstValueFrom(
      this.paymentService.send(
        { cmd: 'process_webhook' },
        { signature, body },
      ),
    );
  }

  // Legacy webhook (keep for backward compatibility)
  @Post('webhook/paystack')
  @ApiOperation({ summary: 'Paystack webhook endpoint (legacy)' })
  async paystackWebhookLegacy(@Headers() headers: any, @Body() body: any) {
    return this.paystackWebhook(headers['x-paystack-signature'], body);
  }
}

