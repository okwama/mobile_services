import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('direct-charter')
@Controller('direct-charter')
export class DirectCharterController {
  constructor(
    @Inject('DIRECT_CHARTER_SERVICE') private readonly directCharterService: ClientProxy,
  ) {}

  @Get('aircraft-types')
  @ApiOperation({ summary: 'Get all aircraft type placeholders' })
  async getAircraftTypes() {
    return firstValueFrom(
      this.directCharterService.send({ cmd: 'get_aircraft_types' }, {}),
    );
  }

  @Get('aircraft')
  @ApiOperation({ summary: 'Get aircraft by type' })
  async getAircraftByType(
    @Query('typeId') typeId?: number,
    @Query('userLocation') userLocation?: string,
  ) {
    return firstValueFrom(
      this.directCharterService.send(
        { cmd: 'get_aircraft_by_type' },
        { typeId, userLocation },
      ),
    );
  }
}

