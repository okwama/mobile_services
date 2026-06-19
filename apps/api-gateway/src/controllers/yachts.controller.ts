import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('yachts')
@Controller('yachts')
export class YachtsController {
  constructor(
    @Inject('YACHT_SERVICE') private readonly yachtService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all yachts' })
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
  ) {
    return firstValueFrom(
      this.yachtService.send({ cmd: 'get_yachts' }, { page, limit, type }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get yacht by ID' })
  async getOne(@Param('id') id: number) {
    return firstValueFrom(
      this.yachtService.send({ cmd: 'get_yacht' }, { id }),
    );
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter yachts' })
  async filter(@Body() filters: any) {
    return firstValueFrom(
      this.yachtService.send({ cmd: 'filter_yachts' }, filters),
    );
  }
}

