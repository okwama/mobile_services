import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { getDatabaseConfig, REDIS_CONFIG } from '@app/common';

// Import entities
import { Payment } from './entities/payment.entity';
import { TransactionLedger } from './entities/transaction-ledger.entity';
import { Commission } from './entities/commission.entity';
import { CompanyPaymentAccount } from './entities/company-payment-account.entity';

// Import modules
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConfig(),
        entities: [Payment, TransactionLedger, CompanyPaymentAccount],
      }),
      inject: [ConfigService],
    }),
    // Register microservice clients
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
    PaymentsModule,
  ],
})
export class PaymentServiceModule {}

