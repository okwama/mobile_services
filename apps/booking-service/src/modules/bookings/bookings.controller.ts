import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern({ cmd: 'create_booking' })
  async createBooking(@Payload() data: any) {
    return this.bookingsService.createBooking(data);
  }

  @MessagePattern({ cmd: 'get_booking' })
  async getBooking(@Payload() data: { id: number }) {
    return this.bookingsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_user_bookings' })
  async getUserBookings(@Payload() data: { userId: string; page?: number; limit?: number }) {
    return this.bookingsService.findByUser(data.userId, data.page, data.limit);
  }

  @MessagePattern({ cmd: 'update_booking_status' })
  async updateBookingStatus(@Payload() data: { id: number; status: string }) {
    return this.bookingsService.updateStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'set_inquiry_quote' })
  async setInquiryQuote(@Payload() data: { id: number; totalPrice: number; adminNotes?: string }) {
    return this.bookingsService.setInquiryQuote(data.id, data.totalPrice, data.adminNotes);
  }

  @MessagePattern({ cmd: 'cancel_booking' })
  async cancelBooking(@Payload() data: { id: number; reason?: string }) {
    return this.bookingsService.cancelBooking(data.id, data.reason);
  }

  @MessagePattern({ cmd: 'update_payment_status' })
  async updatePaymentStatus(@Payload() data: { id: number; paymentStatus: string }) {
    return this.bookingsService.updatePaymentStatus(data.id, data.paymentStatus);
  }
}

