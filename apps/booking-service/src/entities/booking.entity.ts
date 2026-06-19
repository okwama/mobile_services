import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BookingStop } from './booking-stop.entity';
import { CharterPassenger } from './charter-passenger.entity';


export enum BookingStatus {
  PENDING = 'pending',
  PRICED = 'priced',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum BookingType {
  DIRECT = 'direct',
  DEAL = 'deal',
  EXPERIENCE = 'experience',
  YACHT = 'yacht',
}

@Entity('charter_bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int', nullable: true })
  aircraftId: number;

  @Column({ 
    type: 'enum', 
    enum: BookingType 
  })
  bookingType: BookingType;

  @Column({ type: 'int', nullable: true })
  dealId: number;

  @Column({ type: 'int', nullable: true })
  experienceTemplateId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ 
    type: 'enum', 
    enum: BookingStatus, 
    default: BookingStatus.PENDING 
  })
  bookingStatus: BookingStatus;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 50 })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originName: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  originLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  originLongitude: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinationName: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  destinationLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  destinationLongitude: number;

  @Column({ type: 'datetime', nullable: true })
  departureDateTime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedFlightHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceNm: number;

  @Column({ type: 'datetime', nullable: true })
  estimatedArrivalTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  totalAdults: number;

  @Column({ type: 'int', default: 0 })
  totalChildren: number;

  @Column({ type: 'tinyint', default: 0 })
  onboardDining: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseAircraftCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  handlingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  airportCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thirdPartyCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fuelCharge: number;

  // Relations
  @OneToMany(() => CharterPassenger, passenger => passenger.booking)
  passengers: CharterPassenger[];

  @OneToMany(() => BookingStop, stop => stop.booking)
  stops: BookingStop[];
}

