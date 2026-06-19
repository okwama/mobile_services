import { Controller, Get, Post, Query, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('google-earth-engine')
@Controller('google-earth-engine')
export class GoogleEarthEngineController {
  constructor(
    @Inject('LOCATION_SERVICE') private readonly locationService: ClientProxy,
  ) {}

  @Post('search')
  @ApiOperation({ summary: 'Search locations using Google Places API' })
  async searchLocations(@Body() data: {
    query: string;
    type?: string;
    location?: string;
    radius?: number;
  }) {
    return firstValueFrom(
      this.locationService.send(
        { cmd: 'google_search_locations' },
        data,
      ),
    );
  }

  @Get('geocode/reverse')
  @ApiOperation({ summary: 'Reverse geocode coordinates to location' })
  async reverseGeocode(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return firstValueFrom(
      this.locationService.send(
        { cmd: 'reverse_geocode' },
        { 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude) 
        },
      ),
    );
  }

  @Post('reverse-geocode')
  @ApiOperation({ summary: 'Reverse geocode coordinates to location (POST)' })
  async reverseGeocodePost(
    @Body() data: { latitude: number; longitude: number },
  ) {
    return firstValueFrom(
      this.locationService.send(
        { cmd: 'reverse_geocode' },
        { latitude: data.latitude, longitude: data.longitude },
      ),
    );
  }
}

