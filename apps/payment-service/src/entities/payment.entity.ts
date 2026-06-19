import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'card',
  MPESA = 'mpesa',
  WALLET = 'wallet',
  PAYSTACK = 'paystack',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'booking_id', type: 'varchar', length: 255, nullable: true })
  booking_id: string;

  @Column({ type: 'varchar', length: 255 })
  bookingId: string;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  company_id: number;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod 
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  companyAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus,
    default: PaymentStatus.PENDING 
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  paymentGatewayResponse: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ 
    name: 'payment_method',
    type: 'enum', 
    enum: PaymentMethod,
    default: PaymentMethod.CARD 
  })
  payment_method: PaymentMethod;

  @Column({ 
    name: 'payment_status',
    type: 'enum', 
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    nullable: true
  })
  payment_status: PaymentStatus;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  platform_fee: number;

  @Column({ name: 'company_amount', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  company_amount: number;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transaction_id: string;

  @Column({ name: 'payment_gateway_response', type: 'longtext', nullable: true })
  payment_gateway_response: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

