import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  user_id: string;

  @Column({ name: 'booking_id', type: 'varchar', length: 255, nullable: true })
  booking_id: string;

  @Column({ 
    name: 'transaction_type', 
    type: 'enum', 
    enum: ['deposit', 'withdrawal', 'payment', 'refund', 'bonus', 'fee', 'loyalty_earned', 'loyalty_redeemed', 'loyalty_expired', 'loyalty_adjustment']
  })
  transaction_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  amount: number;

  @Column({ name: 'points_amount', type: 'int', default: 0 })
  points_amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  balance_before: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  balance_after: number;

  @Column({ name: 'points_before', type: 'int', default: 0 })
  points_before: number;

  @Column({ name: 'points_after', type: 'int', default: 0 })
  points_after: number;

  @Column({ 
    name: 'payment_method', 
    type: 'enum', 
    enum: ['card', 'mpesa', 'wallet', 'loyalty_points'],
    nullable: true
  })
  payment_method: string;

  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  payment_reference: string;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;
}

