import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy,
  ) {}

  @Get()
  async getUserTrips(@Req() req: any) {
    const userId = req.user.sub;
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'get_user_trips' }, { userId }),
    );
    return { success: true, data: result };
  }

  @Get('pending')
  async getPendingTrips(@Req() req: any) {
    const userId = req.user.sub;
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'get_pending_trips' }, { userId }),
    );
    return { success: true, data: result };
  }

  @Get('status/:status')
  async getTripsByStatus(@Param('status') status: string, @Req() req: any) {
    const userId = req.user.sub;
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'get_trips_by_status' }, { userId, status }),
    );
    return { success: true, data: result };
  }

  @Get('stats/overview')
  async getTripStats(@Req() req: any) {
    const userId = req.user.sub;
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'get_trip_stats' }, { userId }),
    );
    return { success: true, data: result };
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'get_trip_by_id' }, { id }),
    );
    return { success: true, data: result };
  }

  @Post()
  async createTrip(@Body() tripData: any, @Req() req: any) {
    const userId = req.user.sub;
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'create_trip' }, { ...tripData, userId }),
    );
    return { success: true, data: result };
  }

  @Put(':id/status')
  async updateTripStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'update_trip_status' }, { id, status }),
    );
    return { success: true, data: result };
  }

  @Post(':id/review')
  async rateTrip(
    @Param('id') id: string,
    @Body() reviewData: { rating?: number; review?: string; photos?: string; videos?: string },
  ) {
    const result = await firstValueFrom(
      this.bookingClient.send({ cmd: 'rate_trip' }, { id, ...reviewData }),
    );
    return { success: true, data: result };
  }
}

