import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('charter_passengers')
export class CharterPassenger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', type: 'int' })
  bookingId: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ name: 'id_passport_number', type: 'varchar', length: 100, nullable: true })
  idPassportNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_user', type: 'tinyint', default: 0 })
  isUser: boolean;

  // Relations
  @ManyToOne(() => require('./booking.entity').Booking, booking => booking.passengers)
  @JoinColumn({ name: 'booking_id' })
  booking: any;
}

