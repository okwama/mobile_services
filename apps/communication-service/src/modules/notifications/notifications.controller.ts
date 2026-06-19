import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern({ cmd: 'get_notifications' })
  async getNotifications(@Payload() data: { userId: string; limit?: number }) {
    const notifications = this.notificationsService.getRecentNotifications(
      data.userId,
      data.limit || 20,
    );
    return { data: notifications, total: notifications.length };
  }

  @MessagePattern({ cmd: 'get_unread_count' })
  async getUnreadCount(@Payload() data: { userId: string }) {
    const count = this.notificationsService.getUnreadCount(data.userId);
    return { count };
  }

  @MessagePattern({ cmd: 'mark_notification_read' })
  async markAsRead(@Payload() data: { userId: string; notificationId: number }) {
    this.notificationsService.markAsRead(data.userId, data.notificationId);
    return { success: true };
  }

  @MessagePattern({ cmd: 'mark_all_notifications_read' })
  async markAllAsRead(@Payload() data: { userId: string }) {
    this.notificationsService.markAllAsRead(data.userId);
    return { success: true };
  }
}

