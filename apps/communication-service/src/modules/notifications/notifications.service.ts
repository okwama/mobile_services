import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  
  // Store recent notifications in memory for quick access
  private notificationCache: Map<string, any[]> = new Map(); // userId -> notifications[]
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * Add notification to memory cache
   */
  addNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): any {
    const notification = {
      id: Date.now(),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };

    // Get or create user notification list
    if (!this.notificationCache.has(data.userId)) {
      this.notificationCache.set(data.userId, []);
    }

    const userNotifications = this.notificationCache.get(data.userId)!;
    userNotifications.unshift(notification);

    // Keep only recent notifications in cache
    if (userNotifications.length > this.MAX_CACHE_SIZE) {
      userNotifications.pop();
    }

    this.logger.log(`Notification cached for user ${data.userId}: ${data.title}`);
    return notification;
  }

  /**
   * Get recent notifications from cache
   */
  getRecentNotifications(userId: string, limit: number = 20): any[] {
    const notifications = this.notificationCache.get(userId) || [];
    return notifications.slice(0, limit);
  }

  /**
   * Get unread count from cache
   */
  getUnreadCount(userId: string): number {
    const notifications = this.notificationCache.get(userId) || [];
    return notifications.filter(n => !n.isRead).length;
  }

  /**
   * Mark notification as read in cache
   */
  markAsRead(userId: string, notificationId: number): void {
    const notifications = this.notificationCache.get(userId);
    if (!notifications) return;

    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): void {
    const notifications = this.notificationCache.get(userId);
    if (!notifications) return;

    notifications.forEach(n => {
      n.isRead = true;
      n.readAt = new Date();
    });
    
    this.logger.log(`All cached notifications marked as read for user ${userId}`);
  }

  /**
   * Clear cache for a user
   */
  clearUserCache(userId: string): void {
    this.notificationCache.delete(userId);
  }
}

