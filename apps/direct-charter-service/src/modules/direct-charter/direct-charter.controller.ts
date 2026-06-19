import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DirectCharterService } from './direct-charter.service';

@Controller()
export class DirectCharterController {
  constructor(private readonly directCharterService: DirectCharterService) {}

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'direct-charter-service',
      database: 'connected',
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }

  @MessagePattern({ cmd: 'get_aircraft_types' })
  async getAircraftTypes() {
    return this.directCharterService.getAircraftTypes();
  }

  @MessagePattern({ cmd: 'get_aircraft_by_type' })
  async getAircraftByType(@Payload() data: { typeId?: number; userLocation?: string }) {
    return this.directCharterService.getAircraftByType(data.typeId, data.userLocation);
  }

  @MessagePattern({ cmd: 'get_aircraft' })
  async getAircraft(@Payload() data: { id: number }) {
    return this.directCharterService.getAircraftById(data.id);
  }

  @MessagePattern({ cmd: 'check_aircraft_availability' })
  async checkAircraftAvailability(@Payload() data: { aircraftId: number; startDate: string }) {
    return this.directCharterService.checkAircraftAvailability(data.aircraftId, data.startDate);
  }

  @MessagePattern({ cmd: 'get_aircraft_details' })
  async getAircraftDetails(@Payload() data: { aircraftId: number }) {
    return this.directCharterService.getAircraftDetails(data.aircraftId);
  }

  @MessagePattern({ cmd: 'get_company_details' })
  async getCompanyDetails(@Payload() data: { companyId: number }) {
    return this.directCharterService.getCompanyDetails(data.companyId);
  }
}

