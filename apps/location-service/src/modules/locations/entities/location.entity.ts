import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 3, nullable: true, name: 'iata_code' })
  iataCode: string;

  @Column({ type: 'varchar', length: 4, nullable: true, name: 'icao_code' })
  icaoCode: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  municipality: string;

  @Column({ type: 'enum', enum: ['airport', 'city', 'region'], default: 'city' })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'int', nullable: true, name: 'elevation_ft' })
  elevationFt: number;

  @Column({ 
    type: 'enum', 
    enum: ['google', 'ourairports', 'osm', 'manual'], 
    default: 'google',
    nullable: true 
  })
  source: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_verified' })
  lastVerified: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

