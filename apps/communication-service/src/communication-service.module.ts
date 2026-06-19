import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/common';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OneSignalModule } from './modules/onesignal/onesignal.module';
import { DeviceToken } from './entities/device-token.entity';

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
        entities: [DeviceToken],
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    SmsModule,
    NotificationsModule,
    OneSignalModule,
  ],
})
export class CommunicationServiceModule {}

