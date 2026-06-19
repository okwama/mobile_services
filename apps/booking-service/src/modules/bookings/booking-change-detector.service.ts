import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Booking } from '../../entities/booking.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Detects changes to bookings made by external systems (admin panel)
 * and emits appropriate events for notifications
 */
@Injectable()
export class BookingChangeDetectorService implements OnModuleInit {
  private readonly logger = new Logger(BookingChangeDetectorService.name);
  private lastCheckTime: Date;
  private bookingSnapshots: Map<number, any> = new Map(); // bookingId -> snapshot

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @Inject('COMMUNICATION_SERVICE') private commsService: ClientProxy,
  ) {
    // Initialize lastCheckTime to now
    this.lastCheckTime = new Date();
  }

  async onModuleInit() {
    // Initialize snapshots on startup
    await this.initializeSnapshots();
    this.logger.log('BookingChangeDetector initialized');
  }

  /**
   * Load all active bookings into memory for change detection
   * Only track bookings that are:
   * - PENDING (waiting for quote)
   * - PENDING with payment status (waiting for payment after being quoted elsewhere)
   */
  private async initializeSnapshots() {
    const bookings = await this.bookingRepository.find({
      where: [
        { bookingStatus: 'pending' as any }, // Waiting for quote
        { paymentStatus: 'pending' as any }, // Waiting for payment
      ],
      select: ['id', 'userId', 'referenceNumber', 'bookingStatus', 'paymentStatus', 'totalPrice', 'updatedAt'],
    });

    bookings.forEach(booking => {
      // Only track if not yet quoted (totalPrice is 0 or null)
      const price = booking.totalPrice ? parseFloat(booking.totalPrice.toString()) : 0;
      if (price === 0 || booking.paymentStatus === 'pending') {
        this.bookingSnapshots.set(booking.id, {
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          totalPrice: booking.totalPrice,
          updatedAt: booking.updatedAt,
        });
      }
    });

    this.logger.log(`Initialized ${bookings.length} booking snapshots (tracking ${this.bookingSnapshots.size} awaiting quotes/payments)`);
  }

  /**
   * Check for booking changes every 30 seconds
   * 
   * Strategy:
   * 1. First try to find bookings with updated updatedAt (efficient)
   * 2. Also check all tracked bookings for changes (works even if admin doesn't update updatedAt)
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async detectChanges() {
    try {
      const now = new Date();
      
      // Strategy 1: Get bookings updated since last check (if updatedAt is maintained)
      const recentlyUpdated = await this.bookingRepository.find({
        where: {
          updatedAt: MoreThan(this.lastCheckTime),
        },
        select: ['id', 'userId', 'referenceNumber', 'bookingStatus', 'paymentStatus', 'totalPrice', 'updatedAt'],
      });

      // Strategy 2: Also check all tracked bookings (works even if admin doesn't update updatedAt)
      const trackedIds = Array.from(this.bookingSnapshots.keys());
      const trackedBookings = trackedIds.length > 0 
        ? await this.bookingRepository.find({
            where: trackedIds.map(id => ({ id })),
            select: ['id', 'userId', 'referenceNumber', 'bookingStatus', 'paymentStatus', 'totalPrice', 'updatedAt'],
          })
        : [];

      // Merge both sets (remove duplicates by ID)
      const allBookingsMap = new Map();
      [...recentlyUpdated, ...trackedBookings].forEach(b => allBookingsMap.set(b.id, b));
      const allBookings = Array.from(allBookingsMap.values());

      if (allBookings.length > 0) {
        this.logger.log(`Checking ${allBookings.length} bookings for changes (${recentlyUpdated.length} recently updated, ${this.bookingSnapshots.size} currently tracked)`);
      }

      for (const booking of allBookings) {
        await this.processBookingChange(booking);
      }

      this.lastCheckTime = now;
    } catch (error) {
      this.logger.error('Error detecting booking changes:', error);
    }
  }

  /**
   * Process individual booking change and emit appropriate events
   */
  private async processBookingChange(booking: any) {
    const previousSnapshot = this.bookingSnapshots.get(booking.id);
    
    // If no previous snapshot, this is a new booking
    if (!previousSnapshot) {
      this.bookingSnapshots.set(booking.id, {
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        updatedAt: booking.updatedAt,
      });
      return;
    }

    // Detect what changed
    const changes: string[] = [];

    // Normalize price values for comparison (handle decimal as string or number)
    const oldPrice = previousSnapshot.totalPrice 
      ? parseFloat(previousSnapshot.totalPrice.toString()) 
      : 0;
    const newPrice = booking.totalPrice 
      ? parseFloat(booking.totalPrice.toString()) 
      : 0;

    // Check if quote was added (totalPrice changed from 0/null to a positive value)
    if (oldPrice === 0 && newPrice > 0 && booking.bookingStatus === 'priced') {
      changes.push('quoted');
      this.logger.log(`Booking ${booking.referenceNumber} was QUOTED: $${newPrice} - Continuing to track for payment/status changes`);
      
      // Emit booking.quoted event
      this.commsService.emit('booking.quoted', {
        userId: booking.userId,
        bookingId: booking.id,
        referenceNumber: booking.referenceNumber,
        totalPrice: booking.totalPrice,
      });

      // DON'T stop tracking - continue monitoring for payment and status changes
      
    } else if (oldPrice > 0 && newPrice > 0 && oldPrice !== newPrice) {
      // Price updated (not first quote)
      changes.push('price_updated');
      this.logger.log(`Booking ${booking.referenceNumber} price UPDATED: $${oldPrice} → $${newPrice}`);
      
      // Emit price updated event
      this.commsService.emit('booking.price_updated', {
        userId: booking.userId,
        bookingId: booking.id,
        referenceNumber: booking.referenceNumber,
        oldPrice: previousSnapshot.totalPrice,
        newPrice: booking.totalPrice,
      });
    }

    // Check if booking status changed
    if (previousSnapshot.bookingStatus !== booking.bookingStatus) {
      changes.push('status_changed');
      this.logger.log(
        `Booking ${booking.referenceNumber} status: ${previousSnapshot.bookingStatus} → ${booking.bookingStatus}`
      );

      // Emit booking.status_changed event
      this.commsService.emit('booking.status_changed', {
        userId: booking.userId,
        bookingId: booking.id,
        referenceNumber: booking.referenceNumber,
        oldStatus: previousSnapshot.bookingStatus,
        newStatus: booking.bookingStatus,
      });

      // If confirmed, emit specific event and stop tracking
      if (booking.bookingStatus === 'confirmed') {
        this.commsService.emit('booking.confirmed', {
          userId: booking.userId,
          bookingId: booking.id,
          referenceNumber: booking.referenceNumber,
        });
        
        // Remove from tracking - booking is confirmed (final state)
        this.bookingSnapshots.delete(booking.id);
        this.logger.log(`✓ Stopped tracking booking ${booking.id} (confirmed)`);
        return; // Exit early
      }

      // If cancelled, emit specific event and stop tracking
      if (booking.bookingStatus === 'cancelled') {
        this.commsService.emit('booking.cancelled', {
          userId: booking.userId,
          bookingId: booking.id,
          referenceNumber: booking.referenceNumber,
        });
        
        // Remove from tracking - no need to track cancelled bookings
        this.bookingSnapshots.delete(booking.id);
        this.logger.log(`✓ Stopped tracking booking ${booking.id} (cancelled)`);
        return; // Exit early
      }
    }

    // Check if payment status changed
    if (previousSnapshot.paymentStatus !== booking.paymentStatus) {
      changes.push('payment_status_changed');
      this.logger.log(
        `Booking ${booking.referenceNumber} payment: ${previousSnapshot.paymentStatus} → ${booking.paymentStatus}`
      );

      // If payment completed, emit event and stop tracking
      if (booking.paymentStatus === 'paid') {
        this.commsService.emit('payment.completed', {
          userId: booking.userId,
          bookingId: booking.id,
          referenceNumber: booking.referenceNumber,
          amount: booking.totalPrice,
        });
        
        // Remove from tracking - no need to track after payment
        this.bookingSnapshots.delete(booking.id);
        this.logger.log(`✓ Stopped tracking booking ${booking.id} (payment completed)`);
        return; // Exit early
      }
    }

    // Update snapshot
    if (changes.length > 0) {
      this.bookingSnapshots.set(booking.id, {
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        updatedAt: booking.updatedAt,
      });

      this.logger.log(`Processed ${changes.length} changes for booking ${booking.referenceNumber}`);
    }
  }

  /**
   * Manually trigger change detection (can be called from controller)
   */
  async triggerDetection() {
    await this.detectChanges();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      trackedBookings: this.bookingSnapshots.size,
      lastCheckTime: this.lastCheckTime,
    };
  }
}

