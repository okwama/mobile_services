import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharterDealsController } from './charter-deals.controller';
import { CharterDealsService } from './charter-deals.service';
import { CharterDeal } from './entities/charter-deal.entity';
import { ChartersCompany } from './entities/company.entity';
import { Aircraft } from './entities/aircraft.entity';
import { AircraftImage } from './entities/aircraft-image.entity';
import { AircraftTypePlaceholder } from '../../entities/aircraft-type-placeholder.entity';
import { AmenitiesModule } from '../amenities/amenities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CharterDeal, ChartersCompany, Aircraft, AircraftImage, AircraftTypePlaceholder]),
    AmenitiesModule,
  ],
  controllers: [CharterDealsController],
  providers: [CharterDealsService],
  exports: [CharterDealsService],
})
export class CharterDealsModule {}

