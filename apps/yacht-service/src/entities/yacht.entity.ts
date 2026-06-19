import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { YachtCompany } from './yacht-company.entity';
import { YachtImage } from './yacht-image.entity';

export enum YachtType {
  DHOWS = 'dhows',
  YACHTS = 'yachts',
  BOAT = 'boat',
  RAFT = 'raft',
}

export enum MaintenanceStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

@Entity('yachts')
export class Yacht {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ 
    type: 'enum', 
    enum: YachtType 
  })
  type: YachtType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'tinyint', default: 1 })
  isAvailable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerDay: number;

  @Column({ 
    type: 'enum', 
    enum: MaintenanceStatus,
    default: MaintenanceStatus.OPERATIONAL 
  })
  maintenanceStatus: MaintenanceStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'int', nullable: true })
  yachtTypeImagePlaceholderId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => YachtCompany)
  @JoinColumn({ name: 'companyId' })
  company: YachtCompany;

  @OneToMany(() => YachtImage, image => image.yacht)
  images: YachtImage[];
}

