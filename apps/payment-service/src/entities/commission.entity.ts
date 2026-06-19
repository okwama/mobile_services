import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CommissionStatus {
  PENDING = 'pending',
  OWED = 'owed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  bookingId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bookingTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  revenueShareRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ 
    type: 'enum', 
    enum: CommissionStatus,
    default: CommissionStatus.PENDING 
  })
  status: CommissionStatus;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

