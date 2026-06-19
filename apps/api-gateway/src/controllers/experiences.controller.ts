import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(
    @Inject('EXPERIENCE_SERVICE') private readonly experienceService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all experiences' })
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return firstValueFrom(
      this.experienceService.send({ cmd: 'get_experiences' }, { page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get experience by ID' })
  async getOne(@Param('id') id: number) {
    return firstValueFrom(
      this.experienceService.send({ cmd: 'get_experience' }, { id }),
    );
  }

  @Get(':id/schedules')
  @ApiOperation({ summary: 'Get experience schedules' })
  async getSchedules(@Param('id') experienceId: number) {
    return firstValueFrom(
      this.experienceService.send({ cmd: 'get_experience_schedules' }, { experienceId }),
    );
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter experiences' })
  async filter(@Body() filters: any) {
    return firstValueFrom(
      this.experienceService.send({ cmd: 'filter_experiences' }, filters),
    );
  }
}

