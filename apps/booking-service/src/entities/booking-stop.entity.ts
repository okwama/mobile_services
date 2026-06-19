import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LocationType {
  AIRPORT = 'airport',
  CITY = 'city',
  CUSTOM = 'custom',
}

@Entity('charter_booking_stops')
export class BookingStop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', type: 'int' })
  bookingId: number;

  @Column({ name: 'stop_name', type: 'varchar', length: 255 })
  stopName: string;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'datetime', nullable: true })
  datetime: Date;

  @Column({ name: 'stop_order', type: 'int', default: 1 })
  stopOrder: number;

  @Column({ 
    name: 'location_type',
    type: 'enum', 
    enum: LocationType,
    default: LocationType.CUSTOM 
  })
  locationType: LocationType;

  @Column({ name: 'location_code', type: 'varchar', length: 50, nullable: true })
  locationCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => require('./booking.entity').Booking, booking => booking.stops)
  @JoinColumn({ name: 'booking_id' })
  booking: any;
}

