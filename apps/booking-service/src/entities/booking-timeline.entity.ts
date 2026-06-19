import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('booking_timeline')
export class BookingTimeline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  bookingId: string;

  @Column({ type: 'varchar', length: 50 })
  eventType: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oldValue: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  newValue: string;

  @Column({ type: 'longtext', nullable: true })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;
}

