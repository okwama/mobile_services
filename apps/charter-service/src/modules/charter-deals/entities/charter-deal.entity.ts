import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChartersCompany } from './company.entity';
import { Aircraft } from './aircraft.entity';

@Entity('charter_deals')
export class CharterDeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'companyId', type: 'int' })
  companyId: number;

  @Column({ name: 'aircraftId', type: 'int' })
  aircraftId: number;

  @ManyToOne(() => ChartersCompany)
  @JoinColumn({ name: 'companyId' })
  company: ChartersCompany;

  @ManyToOne(() => Aircraft)
  @JoinColumn({ name: 'aircraftId' })
  aircraft: Aircraft;

  @Column({ name: 'originName', type: 'varchar', length: 255 })
  originName: string;

  @Column({ name: 'originLatitude', type: 'decimal', precision: 10, scale: 7 })
  originLatitude: number;

  @Column({ name: 'originLongitude', type: 'decimal', precision: 10, scale: 7 })
  originLongitude: number;

  @Column({ name: 'destinationName', type: 'varchar', length: 255 })
  destinationName: string;

  @Column({ name: 'destinationLatitude', type: 'decimal', precision: 10, scale: 7 })
  destinationLatitude: number;

  @Column({ name: 'destinationLongitude', type: 'decimal', precision: 10, scale: 7 })
  destinationLongitude: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  time: string;

  @Column({ name: 'pricePerSeat', type: 'decimal', precision: 10, scale: 2 })
  pricePerSeat: number;

  @Column({ name: 'discountPerSeat', type: 'int', default: 0 })
  discountPerSeat: number;

  @Column({ name: 'taxType', type: 'varchar', length: 255, nullable: true })
  taxType: string;

  @Column({ name: 'taxAmount', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'availableSeats', type: 'int' })
  availableSeats: number;

  @Column({ name: 'estimatedFlightTimeMinutes', type: 'int' })
  estimatedFlightTimeMinutes: number;

  @Column({ name: 'turnaroundBufferMinutes', type: 'int', default: 30 })
  turnaroundBufferMinutes: number;

  @Column({ name: 'pilotId', type: 'int', nullable: true })
  pilotId: number;

  @Column({ name: 'fixedRouteId', type: 'int', nullable: true })
  fixedRouteId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

