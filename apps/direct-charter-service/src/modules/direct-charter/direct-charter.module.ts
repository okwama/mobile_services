import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectCharterController } from './direct-charter.controller';
import { DirectCharterService } from './direct-charter.service';
import { Aircraft } from '../../entities/aircraft.entity';
import { AircraftImage } from '../../entities/aircraft-image.entity';
import { AircraftTypePlaceholder } from '../../entities/aircraft-type-placeholder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aircraft,
      AircraftImage,
      AircraftTypePlaceholder,
    ]),
  ],
  controllers: [DirectCharterController],
  providers: [DirectCharterService],
  exports: [DirectCharterService],
})
export class DirectCharterModule {}

