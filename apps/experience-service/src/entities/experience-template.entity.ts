import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExperienceSchedule } from './experience-schedule.entity';
import { ExperienceImage } from './experience-image.entity';

@Entity('experience_templates')
export class ExperienceTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  locationName: string;

  @Column({
    type: 'enum',
    enum: [
      'scenic_flights', 'aerial_safaris', 'luxury_transfers', 'special_occasions',
      'adventure_access', 'flight_training', 'sunrise_flights', 'champagne_flights',
      'wildlife_ballooning', 'festival_flights', 'romantic_flights', 'private_group_flights',
      'island_hopping', 'sunset_cruises', 'luxury_events', 'snorkeling_trips',
      'fishing_expeditions', 'coastal_exploration'
    ],
    default: 'scenic_flights',
  })
  category: string;

  @Column({
    type: 'enum',
    enum: ['aircraft', 'balloon', 'yachts'],
  })
  experienceType: string;

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  termsConditions: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  taxType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'int' })
  durationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ExperienceSchedule, schedule => schedule.experience)
  schedules: ExperienceSchedule[];

  @OneToMany(() => ExperienceImage, image => image.experience)
  images: ExperienceImage[];
}

