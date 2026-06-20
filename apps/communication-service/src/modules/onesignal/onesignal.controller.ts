import { Controller, Logger } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { OneSignalService, RegisterDeviceDto } from './onesignal.service';

@Controller()
export class OneSignalController {
  private readonly logger = new Logger(OneSignalController.name);

  constructor(private readonly oneSignalService: OneSignalService) {}

  /**
   * Register device token
   */
  @MessagePattern({ cmd: 'register_device_token' })
  async registerDevice(@Payload() data: RegisterDeviceDto) {
    try {
      const device = await this.oneSignalService.registerDevice(data);
      return {
        success: true,
        message: 'Device registered successfully',
        data: device,
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      this.logger.error(`Failed to register device: ${msg}`);
      return {
        success: false,
        message: msg,
      };
    }
  }

  /**
   * Unregister device token
   */
  @MessagePattern({ cmd: 'unregister_device_token' })
  async unregisterDevice(@Payload() data: { playerId: string }) {
    try {
      await this.oneSignalService.unregisterDevice(data.playerId);
      return {
        success: true,
        message: 'Device unregistered successfully',
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      this.logger.error(`Failed to unregister device: ${msg}`);
      return {
        success: false,
        message: msg,
      };
    }
  }

  /**
   * Get user devices
   */
  @MessagePattern({ cmd: 'get_user_devices' })
  async getUserDevices(@Payload() data: { userId: string }) {
    try {
      const devices = await this.oneSignalService.getUserDevices(data.userId);
      return {
        success: true,
        data: devices,
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      this.logger.error(`Failed to get user devices: ${msg}`);
      return {
        success: false,
        message: msg,
      };
    }
  }

  /**
   * Send test notification
   */
  @MessagePattern({ cmd: 'send_test_notification' })
  async sendTestNotification(@Payload() data: { userId: string }) {
    try {
      const sent = await this.oneSignalService.sendToUser({
        userId: data.userId,
        title: 'Test Notification',
        message: 'OneSignal is working! You will receive real-time updates.',
        data: { type: 'test' },
      });
      
      return {
        success: sent,
        message: sent ? 'Test notification sent' : 'No active devices found',
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      this.logger.error(`Failed to send test notification: ${msg}`);
      return {
        success: false,
        message: msg,
      };
    }
  }
}


