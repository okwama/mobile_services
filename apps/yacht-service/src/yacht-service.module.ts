import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';

// Import entities
import { Yacht } from './entities/yacht.entity';
import { YachtCompany } from './entities/yacht-company.entity';
import { YachtImage } from './entities/yacht-image.entity';
import { YachtAmenity } from './entities/yacht-amenity.entity';

// Import modules
import { YachtsModule } from './modules/yachts/yachts.module';

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
        entities: [YachtCompany, Yacht, YachtImage, YachtAmenity],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    YachtsModule,
  ],
})
export class YachtServiceModule {}

