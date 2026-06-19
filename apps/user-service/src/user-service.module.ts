import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getDatabaseConfig } from '@app/common';

// Import entities
import { User } from './modules/auth/entities/user.entity';
import { PasswordResetToken } from './modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { UserProfile } from './modules/users/entities/user-profile.entity';
import { Passenger } from './modules/passengers/entities/passenger.entity';
import { WalletTransaction } from './modules/wallet/entities/wallet-transaction.entity';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PassengersModule } from './modules/passengers/passengers.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConfig(),
        entities: [User, PasswordResetToken, RefreshToken, UserProfile, Passenger, WalletTransaction],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PassengersModule,
    WalletModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class UserServiceModule {}

