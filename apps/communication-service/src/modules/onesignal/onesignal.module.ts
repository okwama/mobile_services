import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneSignalService } from './onesignal.service';
import { OneSignalController } from './onesignal.controller';
import { DeviceToken } from '../../entities/device-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken])],
  controllers: [OneSignalController],
  providers: [OneSignalService],
  exports: [OneSignalService],
})
export class OneSignalModule {}


