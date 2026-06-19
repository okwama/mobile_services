import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('passengers')
export class Passenger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', type: 'varchar', length: 255 })
  booking_id: string;

  @Column({ name: 'first_name', length: 100 })
  first_name: string;

  @Column({ name: 'last_name', length: 100 })
  last_name: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ name: 'id_passport_number', length: 100, nullable: true })
  id_passport_number: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'is_user', type: 'tinyint', default: 0 })
  is_user: boolean;
}

