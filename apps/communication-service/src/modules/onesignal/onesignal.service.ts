import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { DeviceToken, DeviceType } from '../../entities/device-token.entity';

export interface OneSignalNotification {
  userId: string;
  title: string;
  message: string;
  data?: any;
  url?: string; // Deep link
}

export interface RegisterDeviceDto {
  userId: string;
  playerId: string;
  deviceType: DeviceType;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
}

@Injectable()
export class OneSignalService {
  private readonly logger = new Logger(OneSignalService.name);
  private readonly apiKey: string;
  private readonly appId: string;
  private readonly apiUrl = 'https://onesignal.com/api/v1';

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ONESIGNAL_REST_API_KEY');
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID');

    if (!this.apiKey || !this.appId) {
      this.logger.warn('OneSignal not configured. Push notifications will be disabled.');
    } else {
      this.logger.log('OneSignal service initialized');
    }
  }

  /**
   * Register or update device token
   */
  async registerDevice(dto: RegisterDeviceDto): Promise<DeviceToken> {
    try {
      // Check if player ID already exists
      let deviceToken = await this.deviceTokenRepository.findOne({
        where: { playerId: dto.playerId },
      });

      if (deviceToken) {
        // Update existing token
        deviceToken.userId = dto.userId;
        deviceToken.deviceType = dto.deviceType;
        deviceToken.deviceModel = dto.deviceModel;
        deviceToken.osVersion = dto.osVersion;
        deviceToken.appVersion = dto.appVersion;
        deviceToken.isActive = true;
        deviceToken.lastActiveAt = new Date();
      } else {
        // Create new token
        deviceToken = this.deviceTokenRepository.create({
          userId: dto.userId,
          playerId: dto.playerId,
          deviceType: dto.deviceType,
          deviceModel: dto.deviceModel,
          osVersion: dto.osVersion,
          appVersion: dto.appVersion,
          isActive: true,
          lastActiveAt: new Date(),
        });
      }

      const saved = await this.deviceTokenRepository.save(deviceToken);
      this.logger.log(`Registered device token for user ${dto.userId}: ${dto.playerId}`);
      
      return saved;
    } catch (error) {
      this.logger.error(`Failed to register device token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unregister device token (when user logs out)
   */
  async unregisterDevice(playerId: string): Promise<void> {
    try {
      await this.deviceTokenRepository.update(
        { playerId },
        { isActive: false },
      );
      this.logger.log(`Unregistered device token: ${playerId}`);
    } catch (error) {
      this.logger.error(`Failed to unregister device token: ${error.message}`);
    }
  }

  /**
   * Send notification to specific user (all their devices)
   */
  async sendToUser(notification: OneSignalNotification): Promise<boolean> {
    if (!this.apiKey || !this.appId) {
      this.logger.warn('OneSignal not configured, skipping notification');
      return false;
    }

    try {
      // Get all active device tokens for user
      const devices = await this.deviceTokenRepository.find({
        where: {
          userId: notification.userId,
          isActive: true,
        },
      });

      if (devices.length === 0) {
        this.logger.warn(`No active devices found for user ${notification.userId}`);
        return false;
      }

      const playerIds = devices.map(d => d.playerId);
      
      this.logger.log(`Sending notification to ${playerIds.length} devices for user ${notification.userId}`);

      // Send via OneSignal REST API
      const response = await axios.post(
        `${this.apiUrl}/notifications`,
        {
          app_id: this.appId,
          include_player_ids: playerIds,
          headings: { en: notification.title },
          contents: { en: notification.message },
          data: notification.data || {},
          url: notification.url, // Deep link
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          android_channel_id: this.getAndroidChannelId(notification.data?.type),
        },
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.id) {
        this.logger.log(`OneSignal notification sent successfully: ${response.data.id}`);
        return true;
      } else {
        this.logger.warn(`OneSignal notification failed:`, response.data);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send OneSignal notification: ${error.message}`);
      if (error.response) {
        this.logger.error(`OneSignal API error:`, error.response.data);
      }
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], notification: Omit<OneSignalNotification, 'userId'>): Promise<number> {
    let successCount = 0;
    
    for (const userId of userIds) {
      const sent = await this.sendToUser({ ...notification, userId });
      if (sent) successCount++;
    }

    return successCount;
  }

  /**
   * Get Android channel ID based on notification type
   */
  private getAndroidChannelId(type?: string): string {
    switch (type) {
      case 'booking_quoted':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_status_changed':
        return 'booking_notifications';
      case 'payment_completed':
      case 'payment_failed':
        return 'booking_notifications';
      case 'promotion':
        return 'promotion_notifications';
      case 'security':
        return 'security_notifications';
      default:
        return 'update_notifications';
    }
  }

  /**
   * Get all active devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  /**
   * Cleanup inactive devices (older than 30 days)
   */
  async cleanupInactiveDevices(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.deviceTokenRepository
      .createQueryBuilder()
      .delete()
      .where('is_active = 0 AND updated_at < :date', { date: thirtyDaysAgo })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} inactive device tokens`);
    return result.affected || 0;
  }
}


