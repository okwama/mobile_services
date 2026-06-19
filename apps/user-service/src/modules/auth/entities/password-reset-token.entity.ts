import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ name: 'expiresAt', type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  used: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

