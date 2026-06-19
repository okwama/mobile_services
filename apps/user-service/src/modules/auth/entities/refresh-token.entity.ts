import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ length: 500, comment: 'SHA-256 hash of the refresh token' })
  tokenHash: string;

  @Column({ length: 255, comment: 'Foreign key to users table' })
  userId: string;

  @Column({ type: 'datetime', comment: 'Token expiration timestamp' })
  expiresAt: Date;

  @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Whether token has been revoked' })
  revoked: boolean;

  @Column({ type: 'datetime', nullable: true, comment: 'When token was revoked' })
  revokedAt: Date | null;

  @Column({ length: 100, nullable: true, comment: 'Reason for revocation' })
  revokedReason: string | null;

  @Column({ length: 100, nullable: true, comment: 'Unique device identifier' })
  deviceId: string | null;

  @Column({ length: 200, nullable: true, comment: 'Human-readable device name' })
  deviceName: string | null;

  @Column({ length: 45, nullable: true, comment: 'IP address when token was created' })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true, comment: 'User agent string' })
  userAgent: string | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', comment: 'Token creation timestamp' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', comment: 'Last update timestamp' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Last time token was used' })
  lastUsedAt: Date | null;

  @Column({ type: 'int', default: 0, comment: 'Number of times token was used' })
  usageCount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

