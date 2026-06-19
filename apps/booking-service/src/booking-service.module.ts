import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { getDatabaseConfig, REDIS_CONFIG } from '@app/common';

// Import entities
import { Booking } from './entities/booking.entity';
import { BookingStop } from './entities/booking-stop.entity';
import { CharterPassenger } from './entities/charter-passenger.entity';
import { BookingTimeline } from './entities/booking-timeline.entity';
import { UserTrip } from './entities/user-trip.entity';

// Import modules
import { BookingsModule } from './modules/bookings/bookings.module';
import { TripsModule } from './modules/trips/trips.module';
import { TimelineModule } from './modules/timeline/timeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConfig(),
        entities: [Booking, BookingStop, CharterPassenger, BookingTimeline, UserTrip],
      }),
      inject: [ConfigService],
    }),
    // Register microservice clients
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
    BookingsModule,
    TripsModule,
    TimelineModule,
  ],
})
export class BookingServiceModule {}

