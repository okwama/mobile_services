import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Passenger } from './entities/passenger.entity';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
  ) {}

  async findByBooking(bookingId: string): Promise<Passenger[]> {
    return this.passengerRepository.find({
      where: { booking_id: bookingId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Passenger> {
    const passenger = await this.passengerRepository.findOne({
      where: { id },
    });

    if (!passenger) {
      throw new NotFoundException(`Passenger with ID ${id} not found`);
    }

    return passenger;
  }

  async create(data: Partial<Passenger>): Promise<Passenger> {
    // Validate that booking_id is provided
    if (!data.booking_id) {
      throw new Error('booking_id is required to create a passenger. Passengers should be created via booking creation endpoint.');
    }
    
    const passenger = this.passengerRepository.create(data);
    return this.passengerRepository.save(passenger);
  }

  async update(id: number, updates: Partial<Passenger>): Promise<Passenger> {
    const passenger = await this.findOne(id);
    Object.assign(passenger, updates);
    return this.passengerRepository.save(passenger);
  }

  async delete(id: number): Promise<{ message: string }> {
    const passenger = await this.findOne(id);
    await this.passengerRepository.remove(passenger);
    return { message: 'Passenger deleted successfully' };
  }
}

