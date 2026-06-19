import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('aircrafts')
export class Aircraft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'companyId', type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'registrationNumber', type: 'varchar', length: 20, unique: true })
  registrationNumber: string;

  @Column({ type: 'enum', enum: ['helicopter', 'fixedWing', 'jet', 'glider', 'seaplane', 'ultralight', 'balloon', 'tiltrotor', 'gyroplane', 'airship'] })
  type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ name: 'yearManufactured', type: 'int', nullable: true })
  yearManufactured: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'isAvailable', type: 'tinyint', default: 1 })
  isAvailable: boolean;

  @Column({ name: 'maintenanceStatus', type: 'enum', enum: ['operational', 'maintenance', 'out_of_service'], default: 'operational' })
  maintenanceStatus: string;

  @Column({ name: 'pricePerHour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ name: 'cruiseSpeedKnots', type: 'int', nullable: true })
  cruiseSpeedKnots: number;

  @Column({ name: 'baseAirport', type: 'varchar', length: 100, nullable: true })
  baseAirport: string;

  @Column({ name: 'baseCity', type: 'varchar', length: 100, nullable: true })
  baseCity: string;

  @Column({ name: 'aircraftTypeImagePlaceholderId', type: 'int', nullable: true })
  aircraftTypeImagePlaceholderId: number;

  @Column({ name: 'serviceType', type: 'enum', enum: ['cargo', 'medical'], nullable: true })
  serviceType: string;

  @Column({ name: 'maxLuggageCapacity', type: 'int', nullable: true })
  maxLuggageCapacity: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

