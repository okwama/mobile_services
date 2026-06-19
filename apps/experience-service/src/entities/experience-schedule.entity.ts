import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExperienceTemplate } from './experience-template.entity';

export enum PriceUnit {
  PER_PERSON = 'per_person',
  PER_GROUP = 'per_group',
  PER_HOUR = 'per_hour',
  PER_FLIGHT = 'per_flight',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('experience_schedules')
export class ExperienceSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  experienceId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int', nullable: true })
  aircraftId: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ 
    type: 'enum', 
    enum: PriceUnit,
    default: PriceUnit.PER_PERSON 
  })
  priceUnit: PriceUnit;

  @Column({ type: 'varchar', length: 255, default: '0' })
  taxType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'int' })
  seatsAvailable: number;

  @Column({ 
    type: 'enum', 
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED 
  })
  status: ScheduleStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ExperienceTemplate, template => template.schedules)
  @JoinColumn({ name: 'experienceId' })
  experience: ExperienceTemplate;
}

