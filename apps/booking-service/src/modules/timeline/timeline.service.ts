import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingTimeline } from '../../entities/booking-timeline.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(BookingTimeline)
    private timelineRepository: Repository<BookingTimeline>,
  ) {}

  async create(dto: Partial<BookingTimeline>): Promise<BookingTimeline> {
    const timeline = this.timelineRepository.create(dto);
    return this.timelineRepository.save(timeline);
  }

  async findByBooking(bookingId: string): Promise<BookingTimeline[]> {
    return this.timelineRepository.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }
}

