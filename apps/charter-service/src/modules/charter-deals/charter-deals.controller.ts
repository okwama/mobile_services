import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CharterDealsService } from './charter-deals.service';
import { CHARTER_SERVICE_PATTERNS } from '@app/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller()
export class CharterDealsController {
  constructor(
    private readonly charterDealsService: CharterDealsService,
    @InjectConnection() private connection: Connection,
  ) {}

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    const startTime = Date.now();
    
    let dbStatus = 'disconnected';
    try {
      await this.connection.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      service: 'charter-service',
      database: dbStatus,
      responseTime: `${Date.now() - startTime}ms`,
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.GET_CHARTER_DEALS)
  async getCharterDeals(@Payload() data: any) {
    // If enhanced filters are provided (groupBy, origin, etc.), use findAllWithEnhancedFilters
    const hasEnhancedFilters = data.groupBy !== undefined || data.origin || data.destination || data.aircraftTypeImagePlaceholderId || data.userLat || data.userLng;
    
    if (hasEnhancedFilters) {
      return this.charterDealsService.findAllWithEnhancedFilters(data);
    } else {
      return this.charterDealsService.findAll(data.page || 1, data.limit || 10);
    }
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.GET_CHARTER_DEAL)
  async getCharterDeal(@Payload() data: { id: number }) {
    return this.charterDealsService.findOne(data.id);
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.FILTER_CHARTER_DEALS)
  async filterCharterDeals(@Payload() filters: any) {
    return this.charterDealsService.filterDeals(filters);
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.CHECK_AVAILABILITY)
  async checkAvailability(@Payload() data: { aircraftId: number; startDate: string; endDate: string }) {
    return this.charterDealsService.checkAvailability(data.aircraftId, data.startDate, data.endDate);
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.RESERVE_AIRCRAFT)
  async reserveAircraft(@Payload() data: { aircraftId: number; dates: any }) {
    return this.charterDealsService.reserveAircraft(data.aircraftId, data.dates);
  }

  @MessagePattern(CHARTER_SERVICE_PATTERNS.RELEASE_AIRCRAFT)
  async releaseAircraft(@Payload() data: { reservationId: number }) {
    return this.charterDealsService.releaseAircraft(data.reservationId);
  }

  @MessagePattern({ cmd: 'get_aircraft_types' })
  async getAircraftTypes() {
    return this.charterDealsService.getAircraftTypes();
  }

  @MessagePattern({ cmd: 'get_aircraft_by_type' })
  async getAircraftByType(@Payload() data: { typeId?: number; userLocation?: string }) {
    return this.charterDealsService.getAircraftByType(data.typeId, data.userLocation);
  }

  @MessagePattern({ cmd: 'get_aircraft' })
  async getAircraft(@Payload() data: { id: number }) {
    return this.charterDealsService.getAircraftById(data.id);
  }

  @MessagePattern({ cmd: 'check_aircraft_availability' })
  async checkAircraftAvailability(@Payload() data: { aircraftId: number; startDate: string }) {
    return this.charterDealsService.checkAircraftAvailability(data.aircraftId, data.startDate);
  }
}

