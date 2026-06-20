import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleEarthService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }
  /**
   * Calculate duration between two coordinates
   */
  async calculateDuration(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<string> {
    // Simple estimation: distance / average aircraft speed
    const distance = this.calculateDistance(originLat, originLng, destLat, destLng);
    const averageSpeed = 400; // km/h for aircraft
    const hours = distance / averageSpeed;
    const minutes = Math.round(hours * 60);

    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get route image URL (placeholder for now)
   */
  async getRouteImageUrl(origin: string, destination: string): Promise<string> {
    // TODO: Implement Google Static Maps API or similar
    return `https://via.placeholder.com/800x400?text=${origin}+to+${destination}`;
  }

  /**
   * Search for airports and airstrips using Google Places API
   */
  async searchAirports(query: string, location?: string, radius?: number): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured, returning empty results');
      return [];
    }

    try {
      const params: any = {
        query: query,
        key: this.apiKey,
      };

      // Add location bias if provided
      if (location) {
        params.location = location; // Format: "lat,lng"
        params.radius = radius || 500000; // 500km default for airports
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/place/textsearch/json`, { params })
      );

      if (response.data.status === 'ZERO_RESULTS') {
        return [];
      }

      if (response.data.status !== 'OK') {
        console.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      return response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        types: place.types,
        rating: place.rating,
        operationalStatus: place.business_status, // 'OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'
      }));
    } catch (error) {
      console.error('Error searching airports:', getErrorMessage(error));
      return [];
    }
  }

  /**
   * Reverse geocode coordinates to get location details
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    if (!this.apiKey) {
      return {
        name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        location: { lat: latitude, lng: longitude },
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/geocode/json`, {
          params: {
            latlng: `${latitude},${longitude}`,
            key: this.apiKey,
          },
        })
      );

      if (response.data.status !== 'OK' || !response.data.results.length) {
        return {
          name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          location: { lat: latitude, lng: longitude },
        };
      }

      const result = response.data.results[0];
      return {
        placeId: result.place_id,
        name: this.extractLocationName(result),
        formattedAddress: result.formatted_address,
        location: { lat: latitude, lng: longitude },
        types: result.types,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', getErrorMessage(error));
      return {
        name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        location: { lat: latitude, lng: longitude },
      };
    }
  }

  /**
   * Extract a readable location name from geocoding result
   */
  private extractLocationName(result: any): string {
    // Try to find the most specific name from address components
    const components = result.address_components || [];
    
    // Priority order for name extraction
    const priorities = [
      'airport',
      'locality',
      'sublocality',
      'administrative_area_level_2',
      'administrative_area_level_1',
      'country',
    ];

    for (const priority of priorities) {
      const component = components.find(c => c.types.includes(priority));
      if (component) {
        return component.long_name;
      }
    }

    // Fallback to formatted address
    return result.formatted_address.split(',')[0];
  }
}

