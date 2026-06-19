import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { REDIS_CONFIG } from '@app/common';
import { Booking } from '../../entities/booking.entity';
import { CharterPassenger } from '../../entities/charter-passenger.entity';
import { BookingStop } from '../../entities/booking-stop.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingChangeDetectorService } from './booking-change-detector.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, CharterPassenger, BookingStop]),
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'CHARTER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'DIRECT_CHARTER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'YACHT_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'EXPERIENCE_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'PAYMENT_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'COMMUNICATION_SERVICE',
        ...REDIS_CONFIG,
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingChangeDetectorService],
  exports: [BookingsService],
})
export class BookingsModule {}

