import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TripsService } from './trips.service';

@Controller()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @MessagePattern({ cmd: 'get_user_trips' })
  async getUserTrips(@Payload() data: { userId: string }) {
    return this.tripsService.findByUser(data.userId);
  }

  @MessagePattern({ cmd: 'get_pending_trips' })
  async getPendingTrips(@Payload() data: { userId: string }) {
    return this.tripsService.findPendingByUser(data.userId);
  }

  @MessagePattern({ cmd: 'get_trip_by_id' })
  async getTripById(@Payload() data: { id: string }) {
    return this.tripsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_trips_by_status' })
  async getTripsByStatus(@Payload() data: { userId: string; status: string }) {
    return this.tripsService.findByUserAndStatus(data.userId, data.status);
  }

  @MessagePattern({ cmd: 'create_trip' })
  async createTrip(@Payload() data: any) {
    return this.tripsService.create(data);
  }

  @MessagePattern({ cmd: 'update_trip_status' })
  async updateTripStatus(@Payload() data: { id: string; status: string }) {
    return this.tripsService.updateStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'rate_trip' })
  async rateTrip(@Payload() data: { id: string; rating: number; review?: string; photos?: string; videos?: string }) {
    return this.tripsService.rateTrip(data.id, data.rating, data.review, data.photos, data.videos);
  }

  @MessagePattern({ cmd: 'get_trip_stats' })
  async getTripStats(@Payload() data: { userId: string }) {
    return this.tripsService.getUserTripStats(data.userId);
  }
}

