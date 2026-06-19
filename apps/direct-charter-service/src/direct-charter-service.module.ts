import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';
import { DirectCharterModule } from './modules/direct-charter/direct-charter.module';
import { Aircraft } from './entities/aircraft.entity';
import { AircraftImage } from './entities/aircraft-image.entity';
import { AircraftTypePlaceholder } from './entities/aircraft-type-placeholder.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
      entities: [Aircraft, AircraftImage, AircraftTypePlaceholder],
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    }),
    DirectCharterModule,
  ],
})
export class DirectCharterServiceModule {}
