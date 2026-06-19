import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Yacht } from './yacht.entity';

@Entity('yacht_images')
export class YachtImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  yachtId: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  publicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Yacht, yacht => yacht.images)
  @JoinColumn({ name: 'yachtId' })
  yacht: Yacht;
}

