import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AircraftType {
  HELICOPTER = 'helicopter',
  FIXED_WING = 'fixedWing',
  JET = 'jet',
  GLIDER = 'glider',
  SEAPLANE = 'seaplane',
  ULTRALIGHT = 'ultralight',
  BALLOON = 'balloon',
  TILTROTOR = 'tiltrotor',
  GYROPLANE = 'gyroplane',
  AIRSHIP = 'airship',
}

@Entity('aircraft_type_image_placeholders')
export class AircraftTypePlaceholder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'enum', 
    enum: AircraftType 
  })
  type: AircraftType;

  @Column({ type: 'varchar', length: 255 })
  placeholderImageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  placeholderImagePublicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

