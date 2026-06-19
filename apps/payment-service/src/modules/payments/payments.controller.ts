import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'initialize_payment' })
  async initializePayment(@Payload() data: any) {
    return this.paymentsService.initializePayment(data);
  }

  @MessagePattern({ cmd: 'verify_payment' })
  async verifyPayment(@Payload() data: { reference: string }) {
    return this.paymentsService.verifyPayment(data.reference);
  }

  @MessagePattern({ cmd: 'get_payment' })
  async getPayment(@Payload() data: { id: string }) {
    return this.paymentsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'process_refund' })
  async processRefund(@Payload() data: { paymentId: string; reason?: string }) {
    return this.paymentsService.processRefund(data.paymentId, data.reason);
  }

  @EventPattern('payment.webhook.paystack')
  async handlePaystackWebhook(@Payload() data: any) {
    await this.paymentsService.handleWebhook(data);
  }

  @MessagePattern({ cmd: 'process_webhook' })
  async processWebhook(@Payload() data: { signature: string; body: any }) {
    return this.paymentsService.processWebhook(data);
  }
}

