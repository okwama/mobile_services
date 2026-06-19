import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('charters_companies')
export class ChartersCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'companyName', type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'contactPersonFirstName', type: 'varchar', length: 255 })
  contactPersonFirstName: string;

  @Column({ name: 'contactPersonLastName', type: 'varchar', length: 255 })
  contactPersonLastName: string;

  @Column({ name: 'mobileNumber', type: 'varchar', length: 255 })
  mobileNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoPublicId: string;

  @Column({ type: 'varchar', length: 255 })
  country: string;

  @Column({ name: 'licenseNumber', type: 'varchar', length: 255 })
  licenseNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  license: string;

  @Column({ name: 'licensePublicId', type: 'varchar', length: 255, nullable: true })
  licensePublicId: string;

  @Column({ name: 'onboardedBy', type: 'varchar', length: 255 })
  onboardedBy: string;

  @Column({ name: 'adminId', type: 'int' })
  adminId: number;

  @Column({ type: 'enum', enum: ['pendingReview', 'active', 'inactive', 'rejected', 'draft'], default: 'draft' })
  status: string;

  @Column({ name: 'agreementForm', type: 'varchar', length: 255, nullable: true })
  agreementForm: string;

  @Column({ name: 'agreementFormPublicId', type: 'varchar', length: 255, nullable: true })
  agreementFormPublicId: string;

  @Column({ name: 'approvedBy', type: 'varchar', length: 255, nullable: true })
  approvedBy: string;

  @Column({ name: 'approvedAt', type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ name: 'reviewRemarks', type: 'text', nullable: true })
  reviewRemarks: string;

  @Column({ name: 'revenueShareRate', type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  revenueShareRate: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

