import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { COMMUNICATION_EVENTS } from '@app/common';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Event-driven (async notifications)
  @EventPattern('booking.created')
  async handleBookingCreated(@Payload() data: any) {
    // Send to company
    await this.emailService.sendBookingInquiryEmail(data);
    
    // Send to super admin (bookings@aircharterss.com)
    await this.emailService.sendBookingInquiryEmail({
      ...data,
      companyEmail: 'bookings@aircharterss.com', // Super admin email
    });
  }

  @EventPattern('booking.quoted')
  async handleBookingQuoted(@Payload() data: any) {
    // Email the customer — their quote is ready and they can now pay
    await this.emailService.sendQuoteNotificationEmail(data);
  }

  @EventPattern(COMMUNICATION_EVENTS.BOOKING_CONFIRMED)
  async handleBookingConfirmed(@Payload() data: any) {
    await this.emailService.sendBookingConfirmation(data);
  }

  @EventPattern(COMMUNICATION_EVENTS.PAYMENT_RECEIVED)
  async handlePaymentReceived(@Payload() data: any) {
    await this.emailService.sendPaymentConfirmation(data);
  }

  @EventPattern(COMMUNICATION_EVENTS.USER_REGISTERED)
  async handleUserRegistered(@Payload() data: any) {
    // TODO: Send welcome email
  }

  // Request-response (direct calls)
  @MessagePattern({ cmd: 'send_email' })
  async sendEmail(@Payload() data: { to: string; subject: string; html: string }) {
    return this.emailService.sendEmailWithFallback(data.to, data.subject, data.html);
  }

  @MessagePattern({ cmd: 'send_password_reset' })
  async sendPasswordReset(@Payload() data: { to: string; code: string }) {
    return this.emailService.sendPasswordResetEmail(data.to, data.code);
  }
}

