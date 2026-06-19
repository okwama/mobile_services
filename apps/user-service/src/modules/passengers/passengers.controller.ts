import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PassengersService } from './passengers.service';

@Controller()
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @MessagePattern({ cmd: 'get_booking_passengers' })
  async getBookingPassengers(@Payload() data: { bookingId: string }) {
    return this.passengersService.findByBooking(data.bookingId);
  }

  @MessagePattern({ cmd: 'get_passenger' })
  async getPassenger(@Payload() data: { id: number }) {
    return this.passengersService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_passenger' })
  async createPassenger(@Payload() data: any) {
    return this.passengersService.create(data);
  }

  @MessagePattern({ cmd: 'update_passenger' })
  async updatePassenger(@Payload() data: { id: number; updates: any }) {
    return this.passengersService.update(data.id, data.updates);
  }

  @MessagePattern({ cmd: 'delete_passenger' })
  async deletePassenger(@Payload() data: { id: number }) {
    return this.passengersService.delete(data.id);
  }
}

