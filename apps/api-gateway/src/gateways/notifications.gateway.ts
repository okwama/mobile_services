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

/**
 * API Gateway WebSocket Gateway
 * 
 * This gateway acts as a proxy between clients and the Communication Service.
 * Clients connect here, and we forward events from Communication Service via Redis.
 * 
 * Architecture:
 * Client → API Gateway WebSocket ← Redis ← Communication Service (emits events)
 */
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

  constructor() {
    this.logger.log('NotificationsGateway initialized');
  }

  // Listen for booking events from Communication Service via Redis
  @EventPattern('booking.quoted')
  handleBookingQuoted(data: any) {
    this.logger.log('Received booking.quoted event:', data);
    this.broadcastNotification(data, 'booking_quoted', 'Quote Ready! 🎉', 
      `Your quote for booking ${data.referenceNumber} is ready. Total: $${data.totalPrice}`);
  }

  @EventPattern('booking.confirmed')
  handleBookingConfirmed(data: any) {
    this.logger.log('Received booking.confirmed event:', data);
    this.broadcastNotification(data, 'booking_confirmed', 'Booking Confirmed 🎊',
      `Your booking ${data.referenceNumber} has been confirmed!`);
  }

  @EventPattern('booking.cancelled')
  handleBookingCancelled(data: any) {
    this.logger.log('Received booking.cancelled event:', data);
    this.broadcastNotification(data, 'booking_cancelled', 'Booking Cancelled',
      `Booking ${data.referenceNumber} has been cancelled.`);
  }

  @EventPattern('booking.status_changed')
  handleBookingStatusChanged(data: any) {
    this.logger.log('Received booking.status_changed event:', data);
    this.broadcastNotification(data, 'booking_status_changed', 'Booking Update',
      `Booking ${data.referenceNumber} status changed`);
  }

  @EventPattern('payment.completed')
  handlePaymentCompleted(data: any) {
    this.logger.log('Received payment.completed event:', data);
    this.broadcastNotification(data, 'payment_completed', 'Payment Successful ✅',
      `Payment of $${data.amount} received for ${data.referenceNumber}`);
  }

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

  /**
   * Generic method to broadcast notification
   */
  private broadcastNotification(data: any, type: string, title: string, message: string) {
    if (!data.userId) {
      this.logger.warn(`Event ${type} missing userId, cannot route to client`);
      return;
    }

    const notification = {
      type,
      title,
      message,
      data,
    };

    this.sendNotificationToUser(data.userId, notification);
  }

  /**
   * Send notification to a specific user
   */
  private sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSockets.get(userId);
    
    if (!socketIds || socketIds.size === 0) {
      this.logger.warn(`No active sockets for user ${userId}, notification not sent`);
      return;
    }

    // Send to all connected sockets for this user
    socketIds.forEach((socketId) => {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId} on socket ${socketId}`);
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get all connected sockets for a user
   */
  getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }
}

