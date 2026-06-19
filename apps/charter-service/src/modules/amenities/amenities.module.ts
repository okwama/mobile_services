import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { Amenity } from './entities/amenity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity])],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}

