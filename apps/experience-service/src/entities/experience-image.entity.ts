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

@Entity('experience_images')
export class ExperienceImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  experienceId: number;

  @Column({ type: 'varchar', length: 50 })
  imageSlot: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  publicId: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ExperienceTemplate, template => template.images)
  @JoinColumn({ name: 'experienceId' })
  experience: ExperienceTemplate;
}

