import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Yacht } from '../../entities/yacht.entity';
import { YachtCompany } from '../../entities/yacht-company.entity';
import { YachtImage } from '../../entities/yacht-image.entity';
import { YachtAmenity } from '../../entities/yacht-amenity.entity';
import { YachtsController } from './yachts.controller';
import { YachtsService } from './yachts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([YachtCompany, Yacht, YachtImage, YachtAmenity]),
  ],
  controllers: [YachtsController],
  providers: [YachtsService],
  exports: [YachtsService],
})
export class YachtsModule {}

