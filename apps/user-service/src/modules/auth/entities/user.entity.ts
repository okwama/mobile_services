import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  country_code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  date_of_birth: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 20, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'auto' })
  theme: string;

  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image_public_id: string;

  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @Column({ type: 'varchar', length: 20, default: 'bronze' })
  loyalty_tier: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  wallet_balance: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ name: 'deletion_reason', type: 'text', nullable: true })
  deletion_reason: string;
}

