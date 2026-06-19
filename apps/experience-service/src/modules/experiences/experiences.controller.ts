import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExperiencesService } from './experiences.service';

@Controller()
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @MessagePattern({ cmd: 'get_experiences' })
  async getExperiences(@Payload() data: { page?: number; limit?: number }) {
    return this.experiencesService.findAll(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'get_experience' })
  async getExperience(@Payload() data: { id: number }) {
    return this.experiencesService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_experience_schedules' })
  async getSchedules(@Payload() data: { experienceId: number }) {
    return this.experiencesService.findSchedules(data.experienceId);
  }

  @MessagePattern({ cmd: 'check_experience_availability' })
  async checkAvailability(@Payload() data: { scheduleId: number }) {
    return this.experiencesService.checkAvailability(data.scheduleId);
  }

  @MessagePattern({ cmd: 'filter_experiences' })
  async filterExperiences(@Payload() data: any) {
    return this.experiencesService.filter(data);
  }
}

