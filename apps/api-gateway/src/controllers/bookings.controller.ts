import { Controller, Post, Get, Put, Delete, Body, Param, Query, Inject, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    @Inject('BOOKING_SERVICE') private readonly bookingService: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async createBooking(@Body() body: any, @Req() req) {
    // Extract userId from JWT token
    const userId = req.user?.sub;
    
    if (!userId) {
      return {
        success: false,
        message: 'User authentication required',
      };
    }

    // Debug: Log incoming coordinates from Flutter
    console.log('[GATEWAY] Booking Request Coordinates:', {
      originName: body.originName,
      originLatitude: body.originLatitude,
      originLongitude: body.originLongitude,
      destinationName: body.destinationName,
      destinationLatitude: body.destinationLatitude,
      destinationLongitude: body.destinationLongitude,
    });

    return firstValueFrom(
      this.bookingService.send({ cmd: 'create_booking' }, { ...body, userId }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBooking(@Param('id') id: number) {
    return firstValueFrom(
      this.bookingService.send({ cmd: 'get_booking' }, { id }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  async getUserBookings(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return firstValueFrom(
      this.bookingService.send({ cmd: 'get_user_bookings' }, { userId, page, limit }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return firstValueFrom(
      this.bookingService.send({ cmd: 'update_booking_status' }, { id, status: body.status }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancelBooking(@Param('id') id: number, @Body() body: { reason?: string }) {
    return firstValueFrom(
      this.bookingService.send({ cmd: 'cancel_booking' }, { id, reason: body.reason }),
    );
  }
}

