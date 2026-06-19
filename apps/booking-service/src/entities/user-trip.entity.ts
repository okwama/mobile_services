import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

export enum TripStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('user_trips')
export class UserTrip {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'booking_id', type: 'varchar', length: 255 })
  bookingId: string;

  @Column({ 
    type: 'enum', 
    enum: TripStatus 
  })
  status: TripStatus;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ name: 'review_date', type: 'timestamp', nullable: true })
  reviewDate: Date;

  @Column({ type: 'text', nullable: true })
  photos: string;

  @Column({ type: 'text', nullable: true })
  videos: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;
}

