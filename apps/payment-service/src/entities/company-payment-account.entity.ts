import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentProvider {
  STRIPE = 'stripe',
  MPESA = 'mpesa',
  PAYSTACK = 'paystack',
}

export enum AccountType {
  EXPRESS = 'express',
  CUSTOM = 'custom',
  STANDARD = 'standard',
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Entity('company_payment_accounts')
export class CompanyPaymentAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ 
    type: 'enum', 
    enum: PaymentProvider 
  })
  paymentProvider: PaymentProvider;

  @Column({ 
    type: 'enum', 
    enum: AccountType,
    default: AccountType.EXPRESS 
  })
  accountType: AccountType;

  @Column({ type: 'varchar', length: 255 })
  accountId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paystackSubaccountId: string;

  @Column({ 
    type: 'enum', 
    enum: AccountStatus,
    default: AccountStatus.PENDING 
  })
  accountStatus: AccountStatus;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  verificationStatus: string;

  @Column({ type: 'varchar', length: 2 })
  country: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'longtext', nullable: true })
  capabilities: string;

  @Column({ type: 'longtext', nullable: true })
  requirements: string;

  @Column({ type: 'longtext', nullable: true })
  businessProfile: string;

  @Column({ type: 'longtext', nullable: true })
  bankAccountInfo: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  onboardingUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dashboardUrl: string;

  @Column({ type: 'datetime', nullable: true })
  lastPayoutDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  totalPayouts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  pendingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  availableBalance: number;

  @Column({ type: 'longtext', nullable: true })
  metadata: string;

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

