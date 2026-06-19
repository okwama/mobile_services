import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;
}

