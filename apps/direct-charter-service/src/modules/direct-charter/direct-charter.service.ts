import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aircraft } from '../../entities/aircraft.entity';
import { AircraftImage } from '../../entities/aircraft-image.entity';
import { AircraftTypePlaceholder } from '../../entities/aircraft-type-placeholder.entity';

@Injectable()
export class DirectCharterService {
  constructor(
    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,
    @InjectRepository(AircraftImage)
    private aircraftImageRepository: Repository<AircraftImage>,
    @InjectRepository(AircraftTypePlaceholder)
    private aircraftTypePlaceholderRepository: Repository<AircraftTypePlaceholder>,
  ) {}

  async getAircraftTypes() {
    const types = await this.aircraftTypePlaceholderRepository.find({
      order: { type: 'ASC' },
    });

    return {
      success: true,
      data: types.map(type => ({
        id: type.id,
        type: type.type,
        placeholderImageUrl: type.placeholderImageUrl,
        placeholderImagePublicId: type.placeholderImagePublicId,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      })),
      total: types.length,
      message: `Found ${types.length} aircraft types`,
    };
  }

  async getAircraftByType(typeId?: number, userLocation?: string) {
    let query = this.aircraftRepository
      .createQueryBuilder('aircraft')
      .where('aircraft.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('aircraft.maintenanceStatus = :maintenanceStatus', { maintenanceStatus: 'operational' });

    if (typeId) {
      query = query.andWhere('aircraft.aircraftTypeImagePlaceholderId = :typeId', { typeId });
    }

    const aircraft = await query.getMany();

    const aircraftWithImages = await Promise.all(
      aircraft.map(async (ac) => {
        const images = await this.aircraftImageRepository.find({
          where: { aircraftId: ac.id },
          select: ['url', 'category'],
        });

        return {
          id: ac.id,
          name: ac.name,
          model: ac.model || 'N/A',
          capacity: ac.capacity,
          pricePerHour: ac.pricePerHour,
          baseAirport: ac.baseAirport || '',
          baseCity: ac.baseCity || '',
          companyId: ac.companyId,
          aircraftType: ac.type,
          images: images.map(img => img.url),
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

  async getAircraftDetails(aircraftId: number) {
    const aircraft = await this.aircraftRepository.findOne({
      where: { id: aircraftId },
    });

    if (!aircraft) {
      return null;
    }

    return {
      id: aircraft.id,
      name: aircraft.name,
      model: aircraft.model,
      type: aircraft.type,
      companyId: aircraft.companyId,
      capacity: aircraft.capacity,
      pricePerHour: aircraft.pricePerHour,
      baseAirport: aircraft.baseAirport,
      baseCity: aircraft.baseCity,
    };
  }

  async getMedivacAircraft() {
    const aircraft = await this.aircraftRepository
      .createQueryBuilder('aircraft')
      .where('aircraft.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('aircraft.maintenanceStatus = :status', { status: 'operational' })
      .andWhere('aircraft.serviceType = :serviceType', { serviceType: 'medical' })
      .getMany();

    const aircraftWithImages = await Promise.all(
      aircraft.map(async (ac) => {
        const images = await this.aircraftImageRepository.find({
          where: { aircraftId: ac.id },
          select: ['url', 'category'],
        });

        const company = await this.aircraftRepository.manager.query(
          `SELECT id, companyName, mobileNumber FROM charters_companies WHERE id = ?`,
          [ac.companyId],
        );

        return {
          id: ac.id,
          name: ac.name,
          model: ac.model || 'N/A',
          type: ac.type,
          capacity: ac.capacity,
          pricePerHour: ac.pricePerHour,
          baseAirport: ac.baseAirport || '',
          baseCity: ac.baseCity || '',
          companyId: ac.companyId,
          companyName: company?.[0]?.companyName || null,
          companyPhone: company?.[0]?.mobileNumber || null,
          serviceType: ac.serviceType,
          images: images.map((img) => img.url),
        };
      }),
    );

    return {
      success: true,
      data: aircraftWithImages,
      total: aircraftWithImages.length,
    };
  }

  async getCompanyDetails(companyId: number) {
    // Since we don't have direct access to the charters_companies table in this service,
    // we'll need to query it via raw SQL or return a placeholder
    // For now, let's query via the aircraftRepository's manager
    const result = await this.aircraftRepository.manager.query(
      `SELECT id, companyName, email, mobileNumber FROM charters_companies WHERE id = ?`,
      [companyId]
    );

    if (!result || result.length === 0) {
      return null;
    }

    const company = result[0];
    return {
      id: company.id,
      companyName: company.companyName,
      email: company.email,
      mobileNumber: company.mobileNumber,
    };
  }
}

