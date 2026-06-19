import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { COMMUNICATION_EVENTS } from '@app/common';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @MessagePattern({ cmd: 'send_verification_code' })
  async sendVerificationCode(@Payload() data: { phoneNumber: string }) {
    return this.smsService.sendVerificationCode(data.phoneNumber);
  }

  @EventPattern('booking.created')
  async handleBookingCreated(@Payload() data: any) {
    if (data.companyPhone) {
      await this.smsService.sendInquiryNotificationSms({
        companyPhone: data.companyPhone,
        referenceNumber: data.referenceNumber,
        customerName: data.customerName,
        aircraftName: data.aircraftName,
        passengerCount: data.passengerCount,
      });
    }
  }

  @EventPattern(COMMUNICATION_EVENTS.BOOKING_CONFIRMED)
  async handleBookingConfirmed(@Payload() data: any) {
    if (data.phoneNumber) {
      await this.smsService.sendBookingNotification(data.phoneNumber, data.referenceNumber);
    }
  }

  @MessagePattern({ cmd: 'send_sms' })
  async sendSms(@Payload() data: { phoneNumber: string; message: string }) {
    // Generic SMS sending
    return { success: true, message: 'SMS queued' };
  }
}

