import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceTemplate } from '../../entities/experience-template.entity';
import { ExperienceSchedule } from '../../entities/experience-schedule.entity';
import { ExperienceImage } from '../../entities/experience-image.entity';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExperienceTemplate, ExperienceSchedule, ExperienceImage]),
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}

