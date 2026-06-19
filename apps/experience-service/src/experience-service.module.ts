import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';

// Import entities
import { ExperienceTemplate } from './entities/experience-template.entity';
import { ExperienceSchedule } from './entities/experience-schedule.entity';
import { ExperienceImage } from './entities/experience-image.entity';

// Import modules
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
        entities: [ExperienceTemplate, ExperienceSchedule, ExperienceImage],
      }),
      inject: [ConfigService],
    }),
    ExperiencesModule,
  ],
})
export class ExperienceServiceModule {}

