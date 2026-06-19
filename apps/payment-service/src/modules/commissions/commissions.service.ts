import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Commission, CommissionStatus } from '../../entities/commission.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  /**
   * Calculate commission based on company's revenueShareRate from database
   */
  async calculateCommission(data: {
    bookingId: number;
    companyId: number;
    bookingTotal: number;
    taxAmount: number;
  }): Promise<{ platformFee: number; companyAmount: number; commissionRate: number }> {
    
    // Get company's revenueShareRate from charters_companies table
    const company = await this.dataSource.query(
      'SELECT revenueShareRate FROM charters_companies WHERE id = ?',
      [data.companyId]
    );

    // Use company's rate, or fallback to env default
    let revenueShareRate = company[0]?.revenueShareRate || 0;
    
    if (revenueShareRate === 0) {
      // Fallback to platform default from .env
      const defaultRate = this.configService.get('PLATFORM_COMMISSION_RATE') || 0.15;
      revenueShareRate = parseFloat(defaultRate.toString()) * 100; // Convert 0.15 → 15.00
    }

    // Calculate commission
    const taxableAmount = data.bookingTotal - data.taxAmount;
    const commissionAmount = (taxableAmount * revenueShareRate) / 100;
    const companyAmount = taxableAmount - commissionAmount;

    // Create commission record
    const commission = this.commissionRepository.create({
      bookingId: data.bookingId,
      companyId: data.companyId,
      bookingTotal: data.bookingTotal,
      taxAmount: data.taxAmount,
      revenueShareRate: revenueShareRate,
      commissionAmount: commissionAmount,
      status: CommissionStatus.PENDING,
    });

    await this.commissionRepository.save(commission);

    return {
      platformFee: commissionAmount,
      companyAmount: companyAmount,
      commissionRate: revenueShareRate,
    };
  }

  /**
   * Mark commission as owed after payment completes
   */
  async markAsOwed(bookingId: number) {
    await this.commissionRepository.update(
      { bookingId },
      { status: CommissionStatus.OWED }
    );
  }

  /**
   * Get company commissions
   */
  async getCompanyCommissions(companyId: number) {
    return this.commissionRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }
}

