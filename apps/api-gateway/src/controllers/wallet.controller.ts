import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_PATTERNS } from '@app/common';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@Query('userId') userId: string) {
    return firstValueFrom(
      this.userService.send(USER_SERVICE_PATTERNS.GET_WALLET_BALANCE, { userId }),
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return firstValueFrom(
      this.userService.send({ cmd: 'get_wallet_transactions' }, { userId, page, limit }),
    );
  }

  @Post('add-funds')
  @ApiOperation({ summary: 'Add funds to wallet' })
  async addFunds(@Body() data: { userId: string; amount: number; description?: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'add_wallet_funds' }, data),
    );
  }

  @Post('deduct-funds')
  @ApiOperation({ summary: 'Deduct funds from wallet' })
  async deductFunds(@Body() data: { userId: string; amount: number; description?: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'deduct_wallet_funds' }, data),
    );
  }
}

