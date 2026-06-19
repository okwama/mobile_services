import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_profile')
export class UserProfile {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'seat_preference', type: 'enum', enum: ['window', 'aisle', 'any'], default: 'any' })
  seat_preference: string;

  @Column({ name: 'meal_preference', type: 'text', nullable: true })
  meal_preference: string;

  @Column({ name: 'special_assistance', type: 'text', nullable: true })
  special_assistance: string;

  @Column({ name: 'email_notifications', type: 'tinyint', default: 1 })
  email_notifications: boolean;

  @Column({ name: 'sms_notifications', type: 'tinyint', default: 1 })
  sms_notifications: boolean;

  @Column({ name: 'push_notifications', type: 'tinyint', default: 1 })
  push_notifications: boolean;

  @Column({ name: 'marketing_emails', type: 'tinyint', default: 1 })
  marketing_emails: boolean;

  @Column({ name: 'profile_visible', type: 'tinyint', default: 0 })
  profile_visible: boolean;

  @Column({ name: 'data_sharing', type: 'tinyint', default: 0 })
  data_sharing: boolean;

  @Column({ name: 'location_tracking', type: 'tinyint', default: 1 })
  location_tracking: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

