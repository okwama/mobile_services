import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { REDIS_CONFIG } from '@app/common';
import { Payment } from '../../entities/payment.entity';
import { TransactionLedger } from '../../entities/transaction-ledger.entity';
import { CompanyPaymentAccount } from '../../entities/company-payment-account.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, TransactionLedger, CompanyPaymentAccount]),
    ClientsModule.register([
      {
        name: 'BOOKING_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'COMMUNICATION_SERVICE',
        ...REDIS_CONFIG,
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService],
  exports: [PaymentsService, PaystackService],
})
export class PaymentsModule {}

