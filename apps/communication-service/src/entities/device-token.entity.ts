import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}

@Entity('device_tokens')
@Index(['userId', 'isActive'])
@Index(['isActive', 'updatedAt'])
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @Column({ name: 'player_id', type: 'varchar', length: 255, unique: true })
  playerId: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
  })
  deviceType: DeviceType;

  @Column({ name: 'device_model', type: 'varchar', length: 255, nullable: true })
  deviceModel?: string;

  @Column({ name: 'os_version', type: 'varchar', length: 50, nullable: true })
  osVersion?: string;

  @Column({ name: 'app_version', type: 'varchar', length: 50, nullable: true })
  appVersion?: string;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @Column({
    name: 'last_active_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  lastActiveAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

