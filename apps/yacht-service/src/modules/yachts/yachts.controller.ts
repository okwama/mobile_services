import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { YachtsService } from './yachts.service';

@Controller()
export class YachtsController {
  constructor(private readonly yachtsService: YachtsService) {}

  @MessagePattern({ cmd: 'get_yachts' })
  async getYachts(@Payload() data: { page?: number; limit?: number; type?: string }) {
    return this.yachtsService.findAll(data.page, data.limit, data.type);
  }

  @MessagePattern({ cmd: 'get_yacht' })
  async getYacht(@Payload() data: { id: number }) {
    return this.yachtsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'check_yacht_availability' })
  async checkAvailability(@Payload() data: { yachtId: number; date: Date }) {
    return this.yachtsService.checkAvailability(data.yachtId, data.date);
  }

  @MessagePattern({ cmd: 'filter_yachts' })
  async filterYachts(@Payload() data: any) {
    return this.yachtsService.filter(data);
  }
}

