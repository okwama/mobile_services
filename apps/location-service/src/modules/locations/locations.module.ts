import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { OurAirportsSyncService } from './ourairports-sync.service';
import { Location } from './entities/location.entity';
import { GoogleEarthModule } from '../google-earth/google-earth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    HttpModule, // 🆕 Required for OurAirportsSyncService to download CSV
    GoogleEarthModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 900000, // Default 15 minutes in milliseconds
      max: 1000, // Maximum number of items in cache
    }),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, OurAirportsSyncService],
  exports: [LocationsService, OurAirportsSyncService],
})
export class LocationsModule {}

