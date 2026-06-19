import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperienceTemplate } from '../../entities/experience-template.entity';
import { ExperienceSchedule, ScheduleStatus } from '../../entities/experience-schedule.entity';
import { ExperienceImage } from '../../entities/experience-image.entity';

@Injectable()
export class ExperiencesService {
  [x: string]: any;
  constructor(
    @InjectRepository(ExperienceTemplate)
    private templateRepository: Repository<ExperienceTemplate>,
    @InjectRepository(ExperienceSchedule)
    private scheduleRepository: Repository<ExperienceSchedule>,
    @InjectRepository(ExperienceImage)
    private imageRepository: Repository<ExperienceImage>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, perCategoryLimit: number = 6) {
    // 1) Find distinct categories that have active templates
    const categoriesRaw = await this.templateRepository.createQueryBuilder('t')
      .select('DISTINCT t.category', 'category')
      .where('t.isActive = :active', { active: true })
      .getRawMany<{ category: string }>();

    // Use Set to ensure no duplicate categories (case-insensitive)
    const uniqueCategoryKeys = new Set<string>();
    categoriesRaw.forEach((c) => {
      if (c.category) {
        uniqueCategoryKeys.add(c.category.toLowerCase().trim());
      }
    });

    const categoryKeys = Array.from(uniqueCategoryKeys);
    const totalCategories = categoryKeys.length;

    // 2) Dynamically adjust perCategoryLimit based on number of categories
    // If ≤2 categories: show more cards (12-15) per category
    // If >2 categories: use default perCategoryLimit (6)
    let effectivePerCategoryLimit = perCategoryLimit;
    if (totalCategories <= 2) {
      effectivePerCategoryLimit = 15; // Show more cards when fewer categories
    }

    // 3) For each category, fetch top N templates with images and schedules
    const categories = [] as Array<{ title: string; key: string; total: number; deals: any[] }>;
    const seenTitles = new Set<string>(); // Track titles to prevent duplicate category sections

    for (const keyLower of categoryKeys) {
      // Find the original case key from database
      const originalKey = categoriesRaw.find(
        (c) => c.category?.toLowerCase().trim() === keyLower
      )?.category || keyLower;

      const formattedTitle = this.formatCategoryName(originalKey);

      // Skip if we've already added this category title (prevents duplicates)
      if (seenTitles.has(formattedTitle.toLowerCase())) {
        continue;
      }
      seenTitles.add(formattedTitle.toLowerCase());

      const [templates, totalForCategory] = await this.templateRepository.findAndCount({
        where: { isActive: true, category: originalKey as any },
      relations: ['images', 'schedules'],
      order: { createdAt: 'DESC' },
        take: effectivePerCategoryLimit,
      });

      if (templates.length === 0) continue;

      const deals = this.mapTemplatesToDeals(templates);
      categories.push({
        title: formattedTitle,
        key: originalKey,
        total: totalForCategory,
        deals,
      });
    }

    // 4) Totals: count of all active templates
    const total = await this.templateRepository.count({ where: { isActive: true } });

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / (limit || 1)),
    };
  }

  /**
   * Group experiences by their database category field
   */
  private mapTemplatesToDeals(experiences: ExperienceTemplate[]) {
    return experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        category: exp.category,
        experienceType: exp.experienceType,
        country: exp.country,
        city: exp.city,
        locationName: exp.locationName,
        imageUrl: exp.images?.[0]?.url || null,
        location: `${exp.city}, ${exp.country}`,
        duration: `${exp.durationMinutes} minutes`,
        price: parseFloat(exp.total.toString()),
      total: parseFloat(exp.total.toString()),
      rating: 4.5,
        durationMinutes: exp.durationMinutes,
        taxType: exp.taxType,
        taxAmount: exp.taxAmount,
        subTotal: exp.subTotal,
        isActive: exp.isActive,
        termsConditions: exp.termsConditions,
        images: exp.images || [],
        schedules: exp.schedules || [],
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
    }));
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    const categoryNames = {
      'scenic_flights': 'Scenic Flights',
      'aerial_safaris': 'Aerial Safaris',
      'luxury_transfers': 'Luxury Transfers',
      'special_occasions': 'Special Occasions',
      'adventure_access': 'Adventure Access',
      'flight_training': 'Flight Training',
      'sunrise_flights': 'Sunrise Flights',
      'champagne_flights': 'Champagne Flights',
      'wildlife_ballooning': 'Wildlife Ballooning',
      'festival_flights': 'Festival Flights',
      'romantic_flights': 'Romantic Flights',
      'private_group_flights': 'Private Group Flights',
      'island_hopping': 'Island Hopping',
      'sunset_cruises': 'Sunset Cruises',
      'luxury_events': 'Luxury Events',
      'snorkeling_trips': 'Snorkeling Trips',
      'fishing_expeditions': 'Fishing Expeditions',
      'coastal_exploration': 'Coastal Exploration',
    };

    return categoryNames[category] || category;
  }

  async findOne(id: number): Promise<ExperienceTemplate> {
    const experience = await this.templateRepository.findOne({
      where: { id },
      relations: ['images', 'schedules'],
    });

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return experience;
  }

  async findSchedules(experienceId: number): Promise<ExperienceSchedule[]> {
    return this.scheduleRepository.find({
      where: { 
        experienceId,
        status: ScheduleStatus.SCHEDULED,
      },
      order: { startTime: 'ASC' },
    });
  }

  async checkAvailability(scheduleId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['experience'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    return {
      available: schedule.seatsAvailable > 0 && schedule.status === ScheduleStatus.SCHEDULED,
      schedule,
    };
  }

  async filter(filters: any) {
    const query = this.templateRepository.createQueryBuilder('template')
      .leftJoinAndSelect('template.images', 'images')
      .leftJoinAndSelect('template.schedules', 'schedules')
      .where('template.isActive = :isActive', { isActive: true });

    if (filters.category) {
      query.andWhere('template.category = :category', { category: filters.category });
    }

    if (filters.experienceType) {
      query.andWhere('template.experienceType = :experienceType', { experienceType: filters.experienceType });
    }

    if (filters.country) {
      query.andWhere('template.country = :country', { country: filters.country });
    }

    if (filters.city) {
      query.andWhere('template.city = :city', { city: filters.city });
    }

    if (filters.minPrice) {
      query.andWhere('template.total >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query.andWhere('template.total <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minDuration) {
      query.andWhere('template.durationMinutes >= :minDuration', { minDuration: filters.minDuration });
    }

    if (filters.maxDuration) {
      query.andWhere('template.durationMinutes <= :maxDuration', { maxDuration: filters.maxDuration });
    }

    const experiences = await query.getMany();
    
    // Group filtered experiences by category
    const grouped = this.groupByCategory(experiences);
    
    return {
      categories: grouped,
      total: experiences.length,
    };
  }
}

