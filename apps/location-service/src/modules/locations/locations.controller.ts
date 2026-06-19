import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LocationsService } from './locations.service';
import { OurAirportsSyncService } from './ourairports-sync.service';
import { LOCATION_SERVICE_PATTERNS } from '@app/common';

@Controller()
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly ourAirportsSyncService: OurAirportsSyncService,
  ) {}

  @MessagePattern(LOCATION_SERVICE_PATTERNS.SEARCH_LOCATIONS)
  async searchLocations(@Payload() data: { 
    query: string; 
    type?: string; 
    userLocation?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.locationsService.search(
      data.query, 
      data.type, 
      data.userLocation,
      data.limit || 50,
      data.offset || 0,
    );
  }

  @MessagePattern(LOCATION_SERVICE_PATTERNS.GET_LOCATION)
  async getLocation(@Payload() data: { id: number }) {
    return this.locationsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_all_locations' })
  async getAllLocations(@Payload() data: { type?: string }) {
    return this.locationsService.findAll(data.type);
  }

  @MessagePattern({ cmd: 'calculate_route_duration' })
  async calculateRouteDuration(@Payload() data: { 
    originLat: number; 
    originLng: number; 
    destLat: number; 
    destLng: number;
  }) {
    return this.locationsService.calculateRouteDuration(data);
  }

  @MessagePattern({ cmd: 'get_route_image' })
  async getRouteImage(@Payload() data: { origin: string; destination: string }) {
    return this.locationsService.getRouteImageUrl(data.origin, data.destination);
  }

  @MessagePattern({ cmd: 'get_popular_locations' })
  async getPopularLocations(@Payload() data?: { userCountry?: string }) {
    return this.locationsService.getPopularLocations(data?.userCountry);
  }

  @MessagePattern({ cmd: 'reverse_geocode' })
  async reverseGeocode(@Payload() data: { latitude: number; longitude: number }) {
    return this.locationsService.reverseGeocode(data.latitude, data.longitude);
  }

  @MessagePattern({ cmd: 'google_search_locations' })
  async googleSearchLocations(@Payload() data: {
    query: string;
    type?: string;
    location?: string;
    radius?: number;
  }) {
    return this.locationsService.googleSearch(data.query, data.type, data.location, data.radius);
  }

  /**
   * 🆕 Manually trigger OurAirports sync
   */
  @MessagePattern({ cmd: 'sync_ourairports' })
  async syncOurAirports(@Payload() data?: { countryCode?: string }) {
    const countryCode = data?.countryCode || 'KE';
    return this.ourAirportsSyncService.syncAirports(countryCode);
  }

  /**
   * 🆕 Sync multiple countries at once
   */
  @MessagePattern({ cmd: 'sync_ourairports_multiple' })
  async syncOurAirportsMultiple(@Payload() data: { countryCodes: string[] }) {
    return this.ourAirportsSyncService.syncMultipleCountries(data.countryCodes);
  }
}

