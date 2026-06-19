import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Yacht, YachtType, MaintenanceStatus } from '../../entities/yacht.entity';
import { YachtCompany, CompanyStatus } from '../../entities/yacht-company.entity';
import { YachtImage } from '../../entities/yacht-image.entity';

@Injectable()
export class YachtsService {
  constructor(
    @InjectRepository(Yacht)
    private yachtRepository: Repository<Yacht>,
    @InjectRepository(YachtCompany)
    private companyRepository: Repository<YachtCompany>,
    @InjectRepository(YachtImage)
    private imageRepository: Repository<YachtImage>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, type?: string) {
    const query = this.yachtRepository.createQueryBuilder('yacht')
      .leftJoinAndSelect('yacht.company', 'company')
      .leftJoinAndSelect('yacht.images', 'images')
      .where('yacht.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('yacht.maintenanceStatus = :status', { status: MaintenanceStatus.OPERATIONAL })
      .andWhere('company.status = :companyStatus', { companyStatus: CompanyStatus.ACTIVE });

    if (type) {
      query.andWhere('yacht.type = :type', { type });
    }

    const [yachts, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      yachts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Yacht> {
    const yacht = await this.yachtRepository.findOne({
      where: { id },
      relations: ['company', 'images'],
    });

    if (!yacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    return yacht;
  }

  async checkAvailability(yachtId: number, date: Date) {
    const yacht = await this.findOne(yachtId);
    
    return {
      available: yacht.isAvailable && yacht.maintenanceStatus === MaintenanceStatus.OPERATIONAL,
      yacht,
    };
  }

  async filter(filters: any) {
    const query = this.yachtRepository.createQueryBuilder('yacht')
      .leftJoinAndSelect('yacht.company', 'company')
      .leftJoinAndSelect('yacht.images', 'images')
      .where('yacht.isAvailable = :isAvailable', { isAvailable: true });

    if (filters.type) {
      query.andWhere('yacht.type = :type', { type: filters.type });
    }

    if (filters.city) {
      query.andWhere('yacht.city = :city', { city: filters.city });
    }

    if (filters.minCapacity) {
      query.andWhere('yacht.capacity >= :minCapacity', { minCapacity: filters.minCapacity });
    }

    if (filters.maxPricePerDay) {
      query.andWhere('yacht.pricePerDay <= :maxPrice', { maxPrice: filters.maxPricePerDay });
    }

    return query.getMany();
  }
}

