import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('passengers')
@Controller('passengers')
export class PassengersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get booking passengers' })
  async getBookingPassengers(@Query('bookingId') bookingId: string) {
    return firstValueFrom(
      this.userService.send({ cmd: 'get_booking_passengers' }, { bookingId }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get passenger by ID' })
  async getPassenger(@Param('id') id: number) {
    return firstValueFrom(
      this.userService.send({ cmd: 'get_passenger' }, { id }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create passenger' })
  async createPassenger(@Body() data: any) {
    return firstValueFrom(
      this.userService.send({ cmd: 'create_passenger' }, data),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update passenger' })
  async updatePassenger(@Param('id') id: number, @Body() updates: any) {
    return firstValueFrom(
      this.userService.send({ cmd: 'update_passenger' }, { id, updates }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete passenger' })
  async deletePassenger(@Param('id') id: number) {
    return firstValueFrom(
      this.userService.send({ cmd: 'delete_passenger' }, { id }),
    );
  }
}

