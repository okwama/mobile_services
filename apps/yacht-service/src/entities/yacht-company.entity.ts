import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CompanyStatus {
  PENDING_REVIEW = 'pendingReview',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
  DRAFT = 'draft',
}

@Entity('yachts_companies')
export class YachtCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  contactPersonFirstName: string;

  @Column({ type: 'varchar', length: 255 })
  contactPersonLastName: string;

  @Column({ type: 'varchar', length: 255 })
  mobileNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255 })
  country: string;

  @Column({ type: 'varchar', length: 255 })
  licenseNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoPublicId: string;

  @Column({ type: 'varchar', length: 255 })
  onboardedBy: string;

  @Column({ type: 'int' })
  adminId: number;

  @Column({ 
    type: 'enum', 
    enum: CompanyStatus,
    default: CompanyStatus.DRAFT 
  })
  status: CompanyStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agreementForm: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agreementFormPublicId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  license: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licensePublicId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy: string;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewRemarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

