import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
  ) {}

  async getBalance(userId: string): Promise<{ balance: number; points: number }> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CASE WHEN transaction.transaction_type IN ("deposit", "refund", "bonus") THEN transaction.amount ELSE -transaction.amount END)', 'balance')
      .addSelect('SUM(CASE WHEN transaction.transaction_type IN ("loyalty_earned", "loyalty_adjustment") THEN transaction.points_amount ELSE -transaction.points_amount END)', 'points')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    return {
      balance: parseFloat(result?.balance || 0),
      points: parseInt(result?.points || 0),
    };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addFunds(userId: string, amount: number, description?: string): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // Get current balance
    const { balance } = await this.getBalance(userId);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction = this.transactionRepository.create({
      id: transactionId,
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      points_amount: 0,
      currency: 'USD',
      description: description || 'Wallet top-up',
      balance_before: balance,
      balance_after: balance + amount,
      points_before: 0,
      points_after: 0,
      status: 'completed',
    });

    return this.transactionRepository.save(transaction);
  }

  async deductFunds(userId: string, amount: number, description?: string): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // Check balance
    const { balance } = await this.getBalance(userId);
    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction = this.transactionRepository.create({
      id: transactionId,
      user_id: userId,
      transaction_type: 'payment',
      amount,
      points_amount: 0,
      currency: 'USD',
      description: description || 'Payment from wallet',
      balance_before: balance,
      balance_after: balance - amount,
      points_before: 0,
      points_after: 0,
      status: 'completed',
    });

    return this.transactionRepository.save(transaction);
  }
}

