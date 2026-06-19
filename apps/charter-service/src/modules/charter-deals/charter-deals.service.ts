import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharterDeal } from './entities/charter-deal.entity';
import { ChartersCompany } from './entities/company.entity';
import { Aircraft } from './entities/aircraft.entity';
import { AircraftImage } from './entities/aircraft-image.entity';
import { AircraftTypePlaceholder } from '../../entities/aircraft-type-placeholder.entity';
import { AmenitiesService } from '../amenities/amenities.service';
import { FilterCharterDealsDto } from './dto/filter-charter-deals.dto';
import { PaginatedGroupedResponse, GroupedCharterDeal } from './interfaces/grouped-deal.interface';

@Injectable()
export class CharterDealsService {
  constructor(
    @InjectRepository(CharterDeal)
    private charterDealRepository: Repository<CharterDeal>,
    @InjectRepository(ChartersCompany)
    private companyRepository: Repository<ChartersCompany>,
    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,
    @InjectRepository(AircraftImage)
    private aircraftImageRepository: Repository<AircraftImage>,
    @InjectRepository(AircraftTypePlaceholder)
    private aircraftTypePlaceholderRepository: Repository<AircraftTypePlaceholder>,
    private amenitiesService: AmenitiesService,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const offset = (page - 1) * limit;

    const query = this.charterDealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.company', 'company')
      .leftJoinAndSelect('deal.aircraft', 'aircraft')
      .leftJoin('aircraft_images', 'images', 'images.aircraftId = aircraft.id')
      .where('company.status = :status', { status: 'active' })
      .andWhere('aircraft.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('aircraft.maintenanceStatus = :maintenanceStatus', { maintenanceStatus: 'operational' });

    const total = await query.getCount();

    const deals = await query
      .select([
        'deal.id',
        'deal.companyId',
        'deal.aircraftId',
        'deal.originName',
        'deal.destinationName',
        'deal.originLatitude',
        'deal.originLongitude',
        'deal.destinationLatitude',
        'deal.destinationLongitude',
        'deal.date',
        'deal.time',
        'deal.pricePerSeat',
        'deal.discountPerSeat',
        'deal.availableSeats',
        'deal.estimatedFlightTimeMinutes',
        'company.companyName',
        'company.logo',
        'aircraft.name',
        'aircraft.type',
        'aircraft.capacity',
      ])
      .orderBy('deal.date', 'ASC')
      .addOrderBy('deal.time', 'ASC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    // Transform and add aircraft images
    const transformedDeals = await Promise.all(deals.map(async (deal) => {
      const images = await this.aircraftImageRepository.find({
        where: { aircraftId: deal.deal_aircraftId },
        select: ['url'],
      });

      const amenities = await this.amenitiesService.findByAircraft(deal.deal_aircraftId);

      return {
        id: deal.deal_id,
        companyId: deal.deal_companyId,
        aircraftId: deal.deal_aircraftId,
        originName: deal.deal_originName,
        destinationName: deal.deal_destinationName,
        originLatitude: deal.deal_originLatitude,
        originLongitude: deal.deal_originLongitude,
        destinationLatitude: deal.deal_destinationLatitude,
        destinationLongitude: deal.deal_destinationLongitude,
        date: deal.deal_date,
        time: deal.deal_time,
        pricePerSeat: deal.deal_pricePerSeat,
        discountPerSeat: deal.deal_discountPerSeat,
        availableSeats: deal.deal_availableSeats,
        estimatedFlightTimeMinutes: deal.deal_estimatedFlightTimeMinutes,
        companyName: deal.company_companyName,
        companyLogo: deal.company_logo,
        aircraftName: deal.aircraft_name,
        aircraftType: deal.aircraft_type,
        aircraftCapacity: deal.aircraft_capacity,
        aircraftImages: images.map(img => img.url),
        amenities: amenities.map(a => ({ name: a.name, icon: a.name.toLowerCase() })),
      };
    }));

    return {
      success: true,
      data: transformedDeals,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<any> {
    const deal = await this.charterDealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.company', 'company')
      .leftJoinAndSelect('deal.aircraft', 'aircraft')
      .where('deal.id = :id', { id })
      .getOne();

    if (!deal) {
      throw new NotFoundException(`Charter deal with ID ${id} not found`);
    }

    // Get aircraft images
    const images = await this.aircraftImageRepository.find({
      where: { aircraftId: deal.aircraftId },
    });

    // Get amenities
    const amenities = await this.amenitiesService.findByAircraft(deal.aircraftId);

    return {
      ...deal,
      aircraftImages: images.map(img => img.url),
      amenities: amenities.map(a => ({ name: a.name, icon: a.name.toLowerCase() })),
    };
  }

  async filterDeals(filters: any): Promise<CharterDeal[]> {
    const query = this.charterDealRepository.createQueryBuilder('deal');

    if (filters.originName) {
      query.andWhere('deal.originName LIKE :origin', { origin: `%${filters.originName}%` });
    }

    if (filters.destinationName) {
      query.andWhere('deal.destinationName LIKE :destination', {
        destination: `%${filters.destinationName}%`,
      });
    }

    if (filters.minPrice) {
      query.andWhere('deal.pricePerSeat >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query.andWhere('deal.pricePerSeat <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.date) {
      query.andWhere('deal.date = :date', { date: filters.date });
    }

    if (filters.availableSeats) {
      query.andWhere('deal.availableSeats >= :seats', {
        seats: filters.availableSeats,
      });
    }

    query.orderBy('deal.date', 'ASC');
    query.addOrderBy('deal.time', 'ASC');

    return query.getMany();
  }

  async checkAvailability(
    aircraftId: number,
    startDate: string,
    endDate: string,
  ): Promise<{ available: boolean; message?: string }> {
    // TODO: Implement availability checking logic
    // This would check aircraft_availability and aircraft_calendar tables
    
    return {
      available: true,
      message: 'Aircraft is available for the selected dates',
    };
  }

  async reserveAircraft(aircraftId: number, dates: any): Promise<any> {
    // TODO: Create temporary reservation in aircraft_availability
    
    return {
      reservationId: Math.floor(Math.random() * 10000),
      aircraftId,
      dates,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  async releaseAircraft(reservationId: number): Promise<boolean> {
    // TODO: Release the reservation
    
    return true;
  }

  async findAllWithEnhancedFilters(
    filters: FilterCharterDealsDto,
  ): Promise<PaginatedGroupedResponse | any> {
    const {
      page = 1,
      limit = 10,
      search,
      dealType,
      fromDate,
      toDate,
      aircraftTypeImagePlaceholderId,
      origin,
      destination,
      userLat,
      userLng,
      groupBy = false,
    } = filters;

    const offset = (page - 1) * limit;

    let query = this.charterDealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.company', 'company')
      .leftJoinAndSelect('deal.aircraft', 'aircraft')
      .leftJoinAndSelect('aircraft.aircraftTypeImagePlaceholder', 'aircraftType')
      .leftJoin('aircraft_images', 'images', 'images.aircraftId = aircraft.id')
      .where('company.status = :status', { status: 'active' })
      .andWhere('aircraft.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('aircraft.maintenanceStatus = :maintenanceStatus', { maintenanceStatus: 'operational' });

    // Add search filters
    if (search) {
      query = query.andWhere(
        '(company.companyName LIKE :search OR deal.originName LIKE :search OR deal.destinationName LIKE :search OR aircraft.name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add date filters
    if (fromDate) {
      query = query.andWhere('deal.date >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      query = query.andWhere('deal.date <= :toDate', { toDate: new Date(toDate) });
    }

    // Add aircraft type filter
    if (aircraftTypeImagePlaceholderId) {
      query = query.andWhere('aircraft.aircraftTypeImagePlaceholderId = :aircraftTypeId', { aircraftTypeId: aircraftTypeImagePlaceholderId });
    }

    // Add route filters
    if (origin) {
      query = query.andWhere('deal.originName LIKE :origin', { origin: `%${origin}%` });
    }

    if (destination) {
      query = query.andWhere('deal.destinationName LIKE :destination', { destination: `%${destination}%` });
    }

    // Get total count
    const total = await query.getCount();

    // Add pagination
    query = query
      .select([
        'deal.id',
        'deal.companyId',
        'deal.aircraftId',
        'deal.date',
        'deal.time',
        'deal.pricePerSeat',
        'deal.discountPerSeat',
        'deal.availableSeats',
        'deal.createdAt',
        'deal.updatedAt',
        'deal.originName',
        'deal.destinationName',
        'deal.estimatedFlightTimeMinutes',
        'company.companyName',
        'company.logo',
        'aircraft.name',
        'aircraft.type',
        'aircraft.capacity',
        'aircraft.aircraftTypeImagePlaceholderId',
        'aircraftType.placeholderImageUrl',
        'GROUP_CONCAT(images.url) as aircraftImages',
      ])
      .groupBy('deal.id')
      .orderBy('deal.date', 'ASC')
      .addOrderBy('deal.time', 'ASC')
      .offset(offset)
      .limit(limit);

    const deals = await query.getRawMany();

    if (groupBy) {
      return this.groupDealsByAircraftTypeAndRoute(deals, userLat, userLng, total, page, limit);
    } else {
      // Return regular paginated response
      const transformedDeals = await Promise.all(deals.map(async (deal) => ({
        id: deal.deal_id,
        companyId: deal.deal_companyId,
        aircraftId: deal.deal_aircraftId,
        date: deal.deal_date,
        time: deal.deal_time,
        pricePerSeat: deal.deal_pricePerSeat,
        discountPerSeat: deal.deal_discountPerSeat,
        availableSeats: deal.deal_availableSeats,
        createdAt: deal.deal_createdAt,
        updatedAt: deal.deal_updatedAt,
        companyName: deal.company_companyName,
        companyLogo: deal.company_logo,
        originName: deal.deal_originName,
        destinationName: deal.deal_destinationName,
        routeImageUrl: "",
        aircraftName: deal.aircraft_name,
        aircraftType: deal.aircraft_type,
        aircraftCapacity: deal.aircraft_capacity,
        aircraftImages: deal.aircraftImages ? deal.aircraftImages.split(',') : [],
        routeImages: [],
        duration: deal.deal_estimatedFlightTimeMinutes || 0,
        amenities: await this.amenitiesService.findByAircraft(deal.deal_aircraftId),
      })));

      return {
        success: true,
        data: transformedDeals,
        total,
        page,
        limit,
        totalGroups: 1,
      };
    }
  }

  private async groupDealsByAircraftTypeAndRoute(
    deals: any[],
    userLat?: number,
    userLng?: number,
    total: number = 0,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedGroupedResponse> {
    const groupedMap = new Map<string, any[]>();

    // Group deals by aircraft type ID and route
    for (const deal of deals) {
      const aircraftTypeId = deal.aircraft_aircraftTypeImagePlaceholderId || 0;
      const routeKey = `${deal.deal_originName}-${deal.deal_destinationName}`;
      const groupKey = `${aircraftTypeId}-${routeKey}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, []);
      }
      groupedMap.get(groupKey)!.push(deal);
    }

    // Transform grouped deals
    const groupedDeals: GroupedCharterDeal[] = [];

    for (const [groupKey, groupDeals] of groupedMap) {
      if (groupDeals.length === 0) continue;

      const firstDeal = groupDeals[0];
      const aircraftTypeId = firstDeal.aircraft_aircraftTypeImagePlaceholderId || 0;
      const aircraftType = firstDeal.aircraft_type || 'unknown';
      const aircraftTypeImageUrl = firstDeal.aircraftType_placeholderImageUrl || '';

      // Calculate distance from user if coordinates provided
      let distanceFromUser: number | undefined;
      if (userLat && userLng && firstDeal.deal_originLatitude && firstDeal.deal_originLongitude) {
        try {
          distanceFromUser = this.calculateFlightDistance(
            userLat,
            userLng,
            firstDeal.deal_originLatitude,
            firstDeal.deal_originLongitude
          );
        } catch (error) {
          console.error('Error calculating distance from user:', error);
        }
      }

      // Transform deals in this group
      const transformedDeals = await Promise.all(groupDeals.map(async (deal) => ({
        id: deal.deal_id,
        companyId: deal.deal_companyId,
        aircraftId: deal.deal_aircraftId,
        date: deal.deal_date,
        time: deal.deal_time,
        pricePerSeat: deal.deal_pricePerSeat,
        discountPerSeat: deal.deal_discountPerSeat,
        availableSeats: deal.deal_availableSeats,
        createdAt: deal.deal_createdAt,
        updatedAt: deal.deal_updatedAt,
        companyName: deal.company_companyName,
        companyLogo: deal.company_logo,
        originName: deal.deal_originName,
        destinationName: deal.deal_destinationName,
        routeImageUrl: "",
        aircraftName: deal.aircraft_name,
        aircraftType: deal.aircraft_type,
        aircraftCapacity: deal.aircraft_capacity,
        aircraftImages: deal.aircraftImages ? deal.aircraftImages.split(',') : [],
        routeImages: [],
        duration: deal.deal_estimatedFlightTimeMinutes || 0,
        amenities: await this.amenitiesService.findByAircraft(deal.deal_aircraftId),
      })));

      groupedDeals.push({
        aircraftTypeId,
        aircraftType,
        aircraftTypeImageUrl,
        route: {
          origin: firstDeal.deal_originName || '',
          destination: firstDeal.deal_destinationName || '',
          distanceFromUser,
        },
        deals: transformedDeals as any[],
      });
    }

    // Sort by distance from user if coordinates provided
    if (userLat && userLng) {
      groupedDeals.sort((a, b) => {
        const distanceA = a.route.distanceFromUser || Infinity;
        const distanceB = b.route.distanceFromUser || Infinity;
        return distanceA - distanceB;
      });
    }

    return {
      success: true,
      data: groupedDeals,
      total,
      page,
      limit,
      totalGroups: groupedDeals.length,
    };
  }

  private calculateFlightDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getAircraftTypes() {
    const types = await this.aircraftTypePlaceholderRepository.find({
      order: { type: 'ASC' }
    });
    
    return {
      success: true,
      data: types,
      message: `Found ${types.length} aircraft types`,
    };
  }

  async getAircraftByType(typeId?: number, userLocation?: string) {
    let query = this.aircraftRepository
      .createQueryBuilder('aircraft')
      .leftJoin('charters_companies', 'company', 'company.id = aircraft.companyId')
      .where('aircraft.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('aircraft.maintenanceStatus = :maintenanceStatus', { maintenanceStatus: 'operational' })
      .andWhere('company.status = :companyStatus', { companyStatus: 'active' });

    // Filter by type if provided
    if (typeId) {
      query = query.andWhere('aircraft.aircraftTypeImagePlaceholderId = :typeId', { typeId });
    }

    const aircraft = await query.getMany();

    // Get images for each aircraft
    const aircraftWithImages = await Promise.all(
      aircraft.map(async (ac) => {
        const images = await this.aircraftImageRepository.find({
          where: { aircraftId: ac.id },
          select: ['url', 'category'],
        });

        const amenities = await this.amenitiesService.findByAircraft(ac.id);

        return {
          id: ac.id,
          name: ac.name,
          model: ac.model || 'N/A',
          capacity: ac.capacity,
          pricePerHour: ac.pricePerHour,
          baseAirport: ac.baseAirport || '',
          baseCity: ac.baseCity || '',
          companyId: ac.companyId,
          companyName: 'Charter Company', // TODO: Join company table if needed
          aircraftType: ac.type,
          images: images.map(img => img.url),
          amenities: amenities,
          flightDurationHours: 0, // Will be calculated based on route
        };
      }),
    );

    return {
      success: true,
      data: aircraftWithImages,
      total: aircraftWithImages.length,
      message: `Found ${aircraftWithImages.length} aircraft`,
    };
  }

  async getAircraftById(id: number) {
    const aircraft = await this.aircraftRepository.findOne({
      where: { id },
    });

    if (!aircraft) {
      return null;
    }

    return {
      id: aircraft.id,
      name: aircraft.name,
      model: aircraft.model,
      companyId: aircraft.companyId,
      type: aircraft.type,
      capacity: aircraft.capacity,
      pricePerHour: aircraft.pricePerHour,
      baseAirport: aircraft.baseAirport,
      baseCity: aircraft.baseCity,
    };
  }

  async checkAircraftAvailability(aircraftId: number, startDate: string) {
    const aircraft = await this.aircraftRepository.findOne({
      where: { id: aircraftId },
    });

    if (!aircraft) {
      throw new Error('Aircraft not found');
    }

    if (!aircraft.isAvailable || aircraft.maintenanceStatus !== 'operational') {
      return {
        available: false,
        companyId: aircraft.companyId,
        message: 'Aircraft is not available',
      };
    }

    return {
      available: true,
      companyId: aircraft.companyId,
      aircraft: {
        id: aircraft.id,
        name: aircraft.name,
        model: aircraft.model,
        type: aircraft.type,
        capacity: aircraft.capacity,
        pricePerHour: aircraft.pricePerHour,
      },
    };
  }
}

