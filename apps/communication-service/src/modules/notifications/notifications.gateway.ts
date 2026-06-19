import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { OneSignalService } from '../onesignal/onesignal.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure appropriately for production
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly oneSignalService: OneSignalService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from user sockets map
    for (const [userId, socketIds] of this.userSockets.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; token: string },
  ) {
    // TODO: Verify JWT token
    const { userId } = data;

    // Store socket ID for this user
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    this.logger.log(`User ${userId} authenticated on socket ${client.id}`);
    client.emit('authenticated', { success: true });
  }

  // Event listeners for booking updates
  @EventPattern('booking.created')
  async handleBookingCreated(data: any) {
    this.logger.log('Received booking.created event:', data);
    
    const { userId, bookingId, referenceNumber } = data;
    
    const notification = {
      type: 'booking_created',
      title: 'Inquiry Submitted! ✈️',
      message: `Your inquiry ${referenceNumber} has been submitted. We'll get back to you shortly with a quote.`,
      data: {
        bookingId,
        referenceNumber,
        action: 'view_booking',
      },
    };
    
    // Send both WebSocket AND push notification
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('booking.quoted')
  async handleBookingQuoted(data: any) {
    this.logger.log('Received booking.quoted event:', data);
    
    const { userId, bookingId, referenceNumber, totalPrice } = data;
    
    const notification = {
      type: 'booking_quoted',
      title: 'Quote Ready! 🎉',
      message: `Your quote for booking ${referenceNumber} is ready. Total: $${totalPrice}`,
      data: {
        bookingId,
        referenceNumber,
        totalPrice,
        action: 'view_booking',
      },
    };
    
    // Send both WebSocket AND push notification
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('booking.price_updated')
  async handlePriceUpdated(data: any) {
    this.logger.log('Received booking.price_updated event:', data);
    
    const { userId, bookingId, referenceNumber, oldPrice, newPrice } = data;
    
    const notification = {
      type: 'booking_price_updated',
      title: 'Quote Updated 💰',
      message: `Price for ${referenceNumber} updated from $${oldPrice} to $${newPrice}`,
      data: {
        bookingId,
        referenceNumber,
        oldPrice,
        newPrice,
        action: 'view_booking',
      },
    };
    
    // Send both WebSocket AND push notification
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('payment.completed')
  async handlePaymentCompleted(data: any) {
    this.logger.log('Received payment.completed event:', data);
    
    const { userId, bookingId, referenceNumber, amount } = data;
    
    const notification = {
      type: 'payment_completed',
      title: 'Payment Successful ✅',
      message: `Payment of $${amount} received for ${referenceNumber}`,
      data: {
        bookingId,
        referenceNumber,
        amount,
        action: 'view_trip',
      },
    };
    
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('booking.confirmed')
  async handleBookingConfirmed(data: any) {
    this.logger.log('Received booking.confirmed event:', data);
    
    const { userId, bookingId, referenceNumber } = data;
    
    const notification = {
      type: 'booking_confirmed',
      title: 'Booking Confirmed 🎊',
      message: `Your booking ${referenceNumber} has been confirmed!`,
      data: {
        bookingId,
        referenceNumber,
        action: 'view_trip',
      },
    };
    
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('booking.cancelled')
  async handleBookingCancelled(data: any) {
    this.logger.log('Received booking.cancelled event:', data);
    
    const { userId, bookingId, referenceNumber, reason } = data;
    
    const notification = {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking ${referenceNumber} has been cancelled. ${reason || ''}`,
      data: {
        bookingId,
        referenceNumber,
        action: 'view_trips',
      },
    };
    
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  @EventPattern('booking.status_changed')
  async handleBookingStatusChanged(data: any) {
    this.logger.log('Received booking.status_changed event:', data);
    
    const { userId, bookingId, referenceNumber, oldStatus, newStatus } = data;
    
    const notification = {
      type: 'booking_status_changed',
      title: 'Booking Update',
      message: `Booking ${referenceNumber} status: ${oldStatus} → ${newStatus}`,
      data: {
        bookingId,
        referenceNumber,
        oldStatus,
        newStatus,
        action: 'view_trip',
      },
    };
    
    await this.sendNotificationToUser(userId, notification);
    await this.sendPushNotification(userId, notification);
  }

  // Helper method to send notification to a specific user via WebSocket
  private async sendNotificationToUser(userId: string, notification: any) {
    // Store notification in memory cache
    this.notificationsService.addNotification({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    });

    const socketIds = this.userSockets.get(userId);
    
    if (!socketIds || socketIds.size === 0) {
      this.logger.warn(`No active WebSocket for user ${userId}, notification cached`);
      // Notification is cached for when user comes online
      return;
    }

    // Send to all connected sockets for this user
    socketIds.forEach((socketId) => {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`WebSocket notification sent to user ${userId} on socket ${socketId}`);
    });
  }

  // Helper method to send push notification via OneSignal
  private async sendPushNotification(userId: string, notification: any) {
    try {
      const sent = await this.oneSignalService.sendToUser({
        userId,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        url: this.buildDeepLink(notification.data),
      });

      if (sent) {
        this.logger.log(`Push notification sent to user ${userId} via OneSignal`);
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }
  }

  // Build deep link based on notification data
  private buildDeepLink(data: any): string {
    if (!data) return '';

    switch (data.action) {
      case 'view_booking':
        return `aircharters://trips?bookingId=${data.bookingId}`;
      case 'view_trip':
        return `aircharters://trips`;
      case 'view_trips':
        return `aircharters://trips`;
      default:
        return 'aircharters://home';
    }
  }

  // Broadcast to all connected clients (for general announcements)
  broadcastToAll(notification: any) {
    this.server.emit('announcement', notification);
    this.logger.log('Broadcast notification sent to all clients');
  }

  // Send notification to specific user (can be called from other services)
  sendToUser(userId: string, notification: any) {
    return this.sendNotificationToUser(userId, notification);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Get all connected sockets for a user
  getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }
}

