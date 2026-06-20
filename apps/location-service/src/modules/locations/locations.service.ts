import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Location } from './entities/location.entity';
import { GoogleEarthService } from '../google-earth/google-earth.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private googleEarthService: GoogleEarthService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(type?: string): Promise<Location[]> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return this.locationRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async search(
    query: string, 
    type?: string, 
    userLocation?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: any[]; total: number }> {
    // For first page (offset = 0), try cache first
    if (offset === 0) {
      const cacheKey = `search:${query.toLowerCase().trim()}:${type || 'all'}:${userLocation || 'global'}`;
      
      const cached = await this.cacheManager.get<any[]>(cacheKey);
      if (cached) {
        console.log(`✅ Cache HIT for search: "${query}" - returning first ${Math.min(limit, cached.length)} of ${cached.length} cached results`);
        return {
          data: cached.slice(0, limit),
          total: cached.length,
        };
      }

      console.log(`❌ Cache MISS for search: "${query}" - Fetching fresh data`);
    } else {
      console.log(`📄 Loading page for "${query}" (offset: ${offset}, limit: ${limit})`);
    }

    // First, try Google Places API for real-time, accurate results (first page only)
    let googleResults: any[] = [];
    
    if (offset === 0) {
      try {
        if (type === 'airport' || !type) {
          // Search for airports/airstrips using Google
          googleResults = await this.googleEarthService.searchAirports(
            `${query} airport`,
            userLocation,
          );

          // 🆕 AUTO-SAVE: Save Google results to database for offline/future use
          if (googleResults.length > 0) {
            await this.saveGoogleResultsToDatabase(googleResults);
          }
        }
      } catch (error) {
        console.error('Google search failed, falling back to database:', getErrorMessage(error));
      }
    }

    // Search our database with pagination
    const queryBuilder = this.locationRepository.createQueryBuilder('location');

    queryBuilder.where(
      'location.name LIKE :query OR location.code LIKE :query OR location.country LIKE :query OR location.iataCode LIKE :query OR location.icaoCode LIKE :query',
      { query: `%${query}%` }
    );

    if (type) {
      queryBuilder.andWhere('location.type = :type', { type });
    }

    queryBuilder.orderBy('location.name', 'ASC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(offset);
    queryBuilder.take(limit);

    const dbResults = await queryBuilder.getMany();

    // Merge Google and DB results, removing duplicates (first page only)
    let merged = [...googleResults];
    const googleNames = new Set(googleResults.map(r => r.name.toLowerCase()));

    for (const dbLoc of dbResults) {
      if (!googleNames.has(dbLoc.name.toLowerCase())) {
        merged.push({
          id: dbLoc.id,
          placeId: dbLoc.id.toString(),
          name: dbLoc.name,
          code: dbLoc.code || dbLoc.iataCode || dbLoc.icaoCode,
          iataCode: dbLoc.iataCode,
          icaoCode: dbLoc.icaoCode,
          country: dbLoc.country,
          municipality: dbLoc.municipality,
          formattedAddress: `${dbLoc.name}, ${dbLoc.municipality || dbLoc.country}`,
          location: {
            lat: typeof dbLoc.latitude === 'string' ? parseFloat(dbLoc.latitude) : dbLoc.latitude,
            lng: typeof dbLoc.longitude === 'string' ? parseFloat(dbLoc.longitude) : dbLoc.longitude,
          },
          types: [dbLoc.type],
          source: 'database',
        });
      }
    }

    // Cache first page for 15 minutes
    if (offset === 0) {
      const cacheKey = `search:${query.toLowerCase().trim()}:${type || 'all'}:${userLocation || 'global'}`;
      await this.cacheManager.set(cacheKey, merged, 900000); // 15min in ms
    }

    return {
      data: merged,
      total: total + googleResults.length,
    };
  }

  /**
   * 🆕 AUTO-SAVE: Save Google Places API results to database
   * This populates our DB with accurate, verified airport data
   */
  private async saveGoogleResultsToDatabase(googleResults: any[]): Promise<void> {
    try {
      for (const result of googleResults) {
        // Extract airport codes from place name or formatted address
        const { iataCode, icaoCode } = this.extractAirportCodes(result.name, result.formattedAddress);
        
        // Extract country from formatted address
        const country = this.extractCountry(result.formattedAddress);
        
        // Generate a unique code if we have IATA or ICAO
        const uniqueCode = iataCode || icaoCode || `GGL_${result.placeId.substring(0, 8)}`;

        // Check if location already exists (by name and country to avoid duplicates)
        const existing = await this.locationRepository.findOne({
          where: [
            { code: uniqueCode },
            { name: result.name, country },
          ],
        });

        if (existing) {
          // Update existing record with latest data
          existing.latitude = result.location.lat;
          existing.longitude = result.location.lng;
          existing.iataCode = iataCode || existing.iataCode;
          existing.icaoCode = icaoCode || existing.icaoCode;
          existing.source = 'google';
          existing.lastVerified = new Date();
          
          await this.locationRepository.save(existing);
          console.log(`✅ Updated location: ${result.name}`);
        } else {
          // Create new location record
          const newLocation = this.locationRepository.create({
            name: result.name,
            code: uniqueCode,
            iataCode,
            icaoCode,
            country,
            municipality: this.extractMunicipality(result.formattedAddress),
            type: 'airport',
            latitude: result.location.lat,
            longitude: result.location.lng,
            source: 'google',
            lastVerified: new Date(),
          });

          await this.locationRepository.save(newLocation);
          console.log(`✅ Saved new location: ${result.name}`);
        }
      }
    } catch (error) {
      // Don't fail the search if save fails
      console.error('Error saving Google results to database:', getErrorMessage(error));
    }
  }

  /**
   * Extract IATA/ICAO codes from airport name or address
   * Example: "Jomo Kenyatta International Airport (NBO)" -> IATA: NBO
   */
  private extractAirportCodes(name: string, address: string): { iataCode: string | null; icaoCode: string | null } {
    let iataCode: string | null = null;
    let icaoCode: string | null = null;

    // Look for codes in parentheses (e.g., "Airport (NBO)")
    const codeMatch = (name + ' ' + address).match(/\(([A-Z]{3,4})\)/);
    if (codeMatch) {
      const code = codeMatch[1];
      if (code.length === 3) {
        iataCode = code;
      } else if (code.length === 4) {
        icaoCode = code;
      }
    }

    // Look for IATA codes in name (3 uppercase letters)
    if (!iataCode) {
      const iataMatch = name.match(/\b([A-Z]{3})\b/);
      if (iataMatch) {
        iataCode = iataMatch[1];
      }
    }

    // Look for ICAO codes (4 uppercase letters starting with H for Africa)
    if (!icaoCode) {
      const icaoMatch = (name + ' ' + address).match(/\b(H[A-Z]{3}|[A-Z]{4})\b/);
      if (icaoMatch && icaoMatch[1].length === 4) {
        icaoCode = icaoMatch[1];
      }
    }

    return { iataCode, icaoCode };
  }

  /**
   * Extract country from formatted address
   */
  private extractCountry(formattedAddress: string): string {
    const parts = formattedAddress.split(',');
    return parts[parts.length - 1].trim();
  }

  /**
   * Extract municipality (city) from formatted address
   */
  private extractMunicipality(formattedAddress: string): string | null {
    const parts = formattedAddress.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return null;
  }

  async calculateRouteDuration(data: { 
    originLat: number; 
    originLng: number; 
    destLat: number; 
    destLng: number;
  }): Promise<{ duration: string; distance: number }> {
    const duration = await this.googleEarthService.calculateDuration(
      data.originLat,
      data.originLng,
      data.destLat,
      data.destLng,
    );

    const distance = this.googleEarthService.calculateDistance(
      data.originLat,
      data.originLng,
      data.destLat,
      data.destLng,
    );

    return { duration, distance };
  }

  async getRouteImageUrl(origin: string, destination: string): Promise<{ imageUrl: string }> {
    const imageUrl = await this.googleEarthService.getRouteImageUrl(origin, destination);
    return { imageUrl };
  }

  async getPopularLocations(userCountry?: string): Promise<Location[]> {
    // Create cache key
    const cacheKey = `popular:${userCountry || 'global'}`;
    
    // Try cache first (INSTANT - 10ms)
    const cached = await this.cacheManager.get<Location[]>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for popular locations: ${userCountry || 'global'}`);
      return cached;
    }

    console.log(`❌ Cache MISS for popular locations: ${userCountry || 'global'}`);

    const locations = await this.locationRepository.find({
      where: [
        { type: 'airport' },
        { type: 'city' },
      ],
    });

    // If no user country provided, return alphabetically
    let result: Location[];
    if (!userCountry) {
      result = locations.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Smart prioritization based on user's country
      result = this.prioritizeLocations(locations, userCountry);
    }

    // Cache for 1 hour (3600 seconds)
    await this.cacheManager.set(cacheKey, result, 3600000); // 1hr in ms

    return result;
  }

  private prioritizeLocations(locations: Location[], userCountry: string): Location[] {
    // Define hub airports (major international airports)
    const hubAirports = [
      'NBO', // Nairobi (Kenya hub)
      'MBA', // Mombasa (Kenya hub)
      'WIL', // Wilson (Kenya domestic hub)
      'KIS', // Kisumu (Kenya hub)
      'JNB', // Johannesburg (South Africa hub)
      'CPT', // Cape Town (South Africa hub)
      'ADD', // Addis Ababa (Ethiopia hub)
      'DAR', // Dar es Salaam (Tanzania hub)
      'EBB', // Entebbe (Uganda hub)
      'DXB', // Dubai (Middle East hub)
      'LHR', // London (Europe hub)
    ];

    // Categorize locations
    const sameCountryHubs: Location[] = [];
    const sameCountryOther: Location[] = [];
    const neighboringCountry: Location[] = [];
    const internationalHubs: Location[] = [];
    const otherInternational: Location[] = [];

    const neighboringCountries = this.getNeighboringCountries(userCountry);

    for (const loc of locations) {
      const isHub = hubAirports.includes(loc.code);
      const isSameCountry = loc.country.toLowerCase() === userCountry.toLowerCase();
      const isNeighbor = neighboringCountries.includes(loc.country.toLowerCase());

      if (isSameCountry && isHub) {
        sameCountryHubs.push(loc);
      } else if (isSameCountry) {
        sameCountryOther.push(loc);
      } else if (isNeighbor) {
        neighboringCountry.push(loc);
      } else if (isHub) {
        internationalHubs.push(loc);
      } else {
        otherInternational.push(loc);
      }
    }

    // Sort each category alphabetically
    const sortByName = (a: Location, b: Location) => a.name.localeCompare(b.name);
    sameCountryHubs.sort(sortByName);
    sameCountryOther.sort(sortByName);
    neighboringCountry.sort(sortByName);
    internationalHubs.sort(sortByName);
    otherInternational.sort(sortByName);

    // Combine in priority order
    return [
      ...sameCountryHubs,      // 1. Same country hubs first
      ...sameCountryOther,     // 2. Same country other locations
      ...neighboringCountry,   // 3. Neighboring countries
      ...internationalHubs,    // 4. Major international hubs
      ...otherInternational,   // 5. Other international locations
    ];
  }

  private getNeighboringCountries(country: string): string[] {
    const neighbors: { [key: string]: string[] } = {
      'kenya': ['tanzania', 'uganda', 'ethiopia', 'somalia', 'south sudan'],
      'tanzania': ['kenya', 'uganda', 'rwanda', 'burundi', 'zambia', 'malawi', 'mozambique'],
      'uganda': ['kenya', 'tanzania', 'rwanda', 'south sudan', 'democratic republic of the congo'],
      'ethiopia': ['kenya', 'somalia', 'south sudan', 'sudan', 'eritrea', 'djibouti'],
      'south africa': ['namibia', 'botswana', 'zimbabwe', 'mozambique', 'eswatini', 'lesotho'],
      'nigeria': ['benin', 'niger', 'chad', 'cameroon'],
      'ghana': ['ivory coast', 'burkina faso', 'togo'],
    };

    return neighbors[country.toLowerCase()] || [];
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    // Use Google's reverse geocoding for accurate results
    return this.googleEarthService.reverseGeocode(latitude, longitude);
  }

  async googleSearch(query: string, type?: string, location?: string, radius?: number): Promise<any[]> {
    // Use Google Places API for comprehensive airport/airstrip search
    return this.googleEarthService.searchAirports(query, location, radius);
  }

  async photonSearch(query: string, type?: string, location?: string, radius?: number): Promise<any[]> {
    try {
      const q = encodeURIComponent(query);
      const url = `https://photon.komoot.io/api/?q=${q}&limit=10`;
      const resp = await firstValueFrom(this.httpService.get(url));
      const data = resp.data;

      if (!data || !Array.isArray(data.features)) return [];

      // Map Photon features to a common shape similar to Google results
      const results = data.features.map((f: any) => {
        const props = f.properties || {};
        const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [0, 0];
        return {
          placeId: props.osm_id ? `${props.osm_type || 'osm'}_${props.osm_id}` : props.osm_id || null,
          name: props.name || props.street || props.city || props.label || query,
          formattedAddress: [props.street, props.city, props.state, props.country].filter(Boolean).join(', '),
          location: { lat: coords[1], lng: coords[0] },
          types: [props.osm_key || 'place'],
          source: 'photon',
        };
      });

      return results;
    } catch (error) {
      console.error('Photon search failed:', getErrorMessage(error));
      return [];
    }
  }
}

