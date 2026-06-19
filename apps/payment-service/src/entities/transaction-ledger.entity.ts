import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  PAYMENT_RECEIVED = 'payment_received',
  PLATFORM_FEE = 'platform_fee',
  COMPANY_PAYOUT = 'company_payout',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  MPESA = 'mpesa',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  PAYSTACK = 'paystack',
}

export enum Currency {
  USD = 'USD',
  KES = 'KES',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

@Entity('transaction_ledger')
export class TransactionLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  transactionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentTransactionId: string;

  @Column({ type: 'int', nullable: true })
  companyId: number;

  @Column({ type: 'varchar', length: 100 })
  userId: string;

  @Column({ type: 'int', nullable: true })
  bookingId: number;

  @Column({ 
    type: 'enum', 
    enum: TransactionType 
  })
  transactionType: TransactionType;

  @Column({ 
    type: 'enum', 
    enum: PaymentProvider 
  })
  paymentProvider: PaymentProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerTransactionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD 
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.000000 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  fee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  @Column({ 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.PENDING 
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'longtext', nullable: true })
  metadata: string;

  @Column({ type: 'longtext', nullable: true })
  providerMetadata: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  settledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  reversedAt: Date;

  @Column({ type: 'text', nullable: true })
  reversalReason: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'tinyint', default: 0 })
  isReconciled: boolean;

  @Column({ type: 'datetime', nullable: true })
  reconciledAt: Date;

  @Column({ type: 'text', nullable: true })
  reconciliationNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

