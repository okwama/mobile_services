import { Controller, Get, Post, Query, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { LOCATION_SERVICE_PATTERNS } from '@app/common';
import { getErrorMessage } from '../utils/error.utils';

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
    try {
      const locations = await firstValueFrom(
        this.locationService.send(
          { cmd: 'google_search_locations' },
          data,
        ).pipe(timeout(10000)),
      );

      if (Array.isArray(locations) && locations.length > 0) return locations;
    } catch (error) {
      console.warn('Google search failed, attempting Photon fallback:', getErrorMessage(error));
    }

    // Try Photon as a free fallback
    try {
      const photon = await firstValueFrom(
        this.locationService.send({ cmd: 'photon_search_locations' }, { query: data.query, type: data.type, location: data.location, radius: data.radius }).pipe(timeout(5000)),
      );

      if (Array.isArray(photon) && photon.length > 0) return photon;
    } catch (phError) {
      console.warn('Photon fallback failed:', getErrorMessage(phError));
    }

    // Final fallback to internal search
    return firstValueFrom(
      this.locationService.send(LOCATION_SERVICE_PATTERNS.SEARCH_LOCATIONS, { query: data.query, type: data.type, location: data.location, radius: data.radius }).pipe(timeout(8000)),
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

