import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { USER_SERVICE_PATTERNS } from '@app/common';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @MessagePattern(USER_SERVICE_PATTERNS.GET_WALLET_BALANCE)
  async getBalance(@Payload() data: { userId: string }) {
    return this.walletService.getBalance(data.userId);
  }

  @MessagePattern({ cmd: 'get_wallet_transactions' })
  async getTransactions(@Payload() data: { userId: string; page?: number; limit?: number }) {
    return this.walletService.getTransactions(data.userId, data.page, data.limit);
  }

  @MessagePattern({ cmd: 'add_wallet_funds' })
  async addFunds(@Payload() data: { userId: string; amount: number; description?: string }) {
    return this.walletService.addFunds(data.userId, data.amount, data.description);
  }

  @MessagePattern({ cmd: 'deduct_wallet_funds' })
  async deductFunds(@Payload() data: { userId: string; amount: number; description?: string }) {
    return this.walletService.deductFunds(data.userId, data.amount, data.description);
  }
}

