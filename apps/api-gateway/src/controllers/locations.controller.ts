import { Controller, Get, Post, Query, Param, Inject, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { LOCATION_SERVICE_PATTERNS } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(
    @Inject('LOCATION_SERVICE') private readonly locationService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  async getAll(@Query('type') type?: string) {
    return firstValueFrom(
      this.locationService.send({ cmd: 'get_all_locations' }, { type }),
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search locations using Google Places API' })
  async search(
    @Query('query') query: string,
    @Query('type') type?: string,
    @Query('q') q?: string,
  ) {
    // Support both 'query' and 'q' params
    const searchQuery = query || q;
    
    if (!searchQuery) {
      return {
        success: false,
        message: 'Search query is required',
        data: [],
        count: 0,
      };
    }

    // Use Google search for comprehensive results
    const locations = await firstValueFrom(
      this.locationService.send(
        { cmd: 'google_search_locations' },
        { query: searchQuery, type },
      ),
    );
    
    return {
      success: true,
      message: 'Locations found',
      data: locations,
      count: locations.length,
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular locations (prioritized by user country)' })
  @UseGuards(JwtAuthGuard)
  async getPopular(@Req() req, @Query('country') country?: string) {
    // Get user's country from their profile or use query param
    let userCountry = country;
    
    // If user is authenticated, try to get their country from profile
    if (req.user?.sub && !userCountry) {
      try {
        const userProfile = await firstValueFrom(
          this.userService.send({ cmd: 'get_user_profile' }, { userId: req.user.sub }),
        );
        userCountry = userProfile?.user?.nationality || userProfile?.profile?.country || 'Kenya';
      } catch (error) {
        // If we can't get user profile, default to Kenya
        console.log('Could not fetch user profile for location prioritization, defaulting to Kenya');
        userCountry = 'Kenya';
      }
    } else if (!userCountry) {
      // Default to Kenya if no user is authenticated
      userCountry = 'Kenya';
    }

    const locations = await firstValueFrom(
      this.locationService.send({ cmd: 'get_popular_locations' }, { userCountry }),
    );
    
    return {
      success: true,
      message: userCountry 
        ? `Popular locations (prioritized for ${userCountry})`
        : 'Popular locations retrieved successfully',
      data: locations,
      count: locations.length,
      prioritizedBy: userCountry || null,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  async getOne(@Param('id') id: number) {
    return firstValueFrom(
      this.locationService.send(LOCATION_SERVICE_PATTERNS.GET_LOCATION, { id }),
    );
  }

  /**
   * 🆕 Manual OurAirports Sync
   * Trigger sync for a specific country or multiple countries
   */
  @Post('sync-ourairports')
  @ApiOperation({ summary: 'Manually sync airports from OurAirports' })
  async syncOurAirports(@Query('country') countryCode?: string) {
    const result = await firstValueFrom(
      this.locationService.send(
        { cmd: 'sync_ourairports' },
        { countryCode: countryCode || 'KE' }
      )
    );

    return {
      success: true,
      message: `OurAirports sync completed for ${countryCode || 'KE'}`,
      ...result,
    };
  }

  /**
   * 🆕 Manual OurAirports Sync (Multiple Countries)
   */
  @Post('sync-ourairports-multiple')
  @ApiOperation({ summary: 'Sync airports for multiple countries' })
  async syncOurAirportsMultiple(@Query('countries') countries?: string) {
    // Parse countries from query param (comma-separated)
    const countryCodes = countries ? countries.split(',').map(c => c.trim()) : ['KE', 'TZ', 'UG', 'RW', 'ET'];

    const result = await firstValueFrom(
      this.locationService.send(
        { cmd: 'sync_ourairports_multiple' },
        { countryCodes }
      )
    );

    return {
      success: true,
      message: `OurAirports sync completed for ${countryCodes.join(', ')}`,
      results: result,
    };
  }
}

