import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CHARTER_SERVICE_PATTERNS } from '@app/common';

@ApiTags('charter-deals')
@Controller('charter-deals')
export class CharterDealsController {
  constructor(
    @Inject('CHARTER_SERVICE') private readonly charterService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all charter deals (paginated)' })
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return firstValueFrom(
      this.charterService.send(CHARTER_SERVICE_PATTERNS.GET_CHARTER_DEALS, { page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get charter deal by ID' })
  async getOne(@Param('id') id: number) {
    return firstValueFrom(
      this.charterService.send(CHARTER_SERVICE_PATTERNS.GET_CHARTER_DEAL, { id }),
    );
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter charter deals' })
  async filter(@Body() filters: any) {
    return firstValueFrom(
      this.charterService.send(CHARTER_SERVICE_PATTERNS.FILTER_CHARTER_DEALS, filters),
    );
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Check aircraft availability' })
  async checkAvailability(
    @Body() data: { aircraftId: number; startDate: string; endDate: string },
  ) {
    return firstValueFrom(
      this.charterService.send(CHARTER_SERVICE_PATTERNS.CHECK_AVAILABILITY, data),
    );
  }
}

