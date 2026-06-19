import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { TimelineService } from './timeline.service';

@Controller()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @MessagePattern({ cmd: 'get_booking_timeline' })
  async getBookingTimeline(@Payload() data: { bookingId: string }) {
    return this.timelineService.findByBooking(data.bookingId);
  }

  @EventPattern('booking.created')
  async handleBookingCreated(@Payload() data: any) {
    await this.timelineService.create({
      bookingId: data.bookingId.toString(),
      eventType: 'created',
      title: 'Booking Created',
      description: `Booking ${data.referenceNumber} created`,
    });
  }

  @EventPattern('payment.completed')
  async handlePaymentCompleted(@Payload() data: any) {
    await this.timelineService.create({
      bookingId: data.bookingId.toString(),
      eventType: 'payment_received',
      title: 'Payment Received',
      description: `Payment of ${data.amount} ${data.currency} received`,
      metadata: JSON.stringify(data),
    });
  }

  @EventPattern('booking.confirmed')
  async handleBookingConfirmed(@Payload() data: any) {
    await this.timelineService.create({
      bookingId: data.bookingId.toString(),
      eventType: 'confirmed',
      title: 'Booking Confirmed',
      description: 'Booking has been confirmed',
    });
  }
}

