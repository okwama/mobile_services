import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';

// Import entities
import { CharterDeal } from './modules/charter-deals/entities/charter-deal.entity';
import { ChartersCompany } from './modules/charter-deals/entities/company.entity';
import { Aircraft } from './modules/charter-deals/entities/aircraft.entity';
import { AircraftImage } from './modules/charter-deals/entities/aircraft-image.entity';
import { Amenity } from './modules/amenities/entities/amenity.entity';
import { AircraftTypePlaceholder } from './entities/aircraft-type-placeholder.entity';

// Import modules
import { CharterDealsModule } from './modules/charter-deals/charter-deals.module';
import { AircraftModule } from './modules/aircraft/aircraft.module';
import { AmenitiesModule } from './modules/amenities/amenities.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';

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
        entities: [CharterDeal, ChartersCompany, Aircraft, AircraftImage, Amenity, AircraftTypePlaceholder],
      }),
      inject: [ConfigService],
    }),
    CharterDealsModule,
    AircraftModule,
    AmenitiesModule,
    ExperiencesModule,
  ],
  controllers: [],
  providers: [],
})
export class CharterServiceModule {}

