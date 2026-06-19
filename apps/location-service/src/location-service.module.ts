import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';

// Import entities
import { Location } from './modules/locations/entities/location.entity';

// Import modules
import { LocationsModule } from './modules/locations/locations.module';
import { GoogleEarthModule } from './modules/google-earth/google-earth.module';

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
        entities: [Location],
      }),
      inject: [ConfigService],
    }),
    LocationsModule,
    GoogleEarthModule,
  ],
  controllers: [],
  providers: [],
})
export class LocationServiceModule {}

