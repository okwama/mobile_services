import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTrip, TripStatus } from '../../entities/user-trip.entity';
import { Booking } from '../../entities/booking.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(UserTrip)
    private tripRepository: Repository<UserTrip>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(dto: any): Promise<UserTrip> {
    const trip = this.tripRepository.create({
      id: this.generateTripId(),
      userId: dto.userId,
      bookingId: dto.bookingId,
      status: TripStatus.UPCOMING,
    });

    return this.tripRepository.save(trip);
  }

  async findByUser(userId: string): Promise<any[]> {
    // Get all bookings for the user with full details including aircraft name
    const result = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.passengers', 'passengers')
      .leftJoinAndSelect('booking.stops', 'stops')
      .leftJoin('aircrafts', 'aircraft', 'aircraft.id = booking.aircraftId')
      .addSelect('aircraft.name', 'aircraftName')
      .where('booking.userId = :userId', { userId })
      .orderBy('booking.createdAt', 'DESC')
      .getRawAndEntities();

    // Map aircraft names to bookings
    const bookingsWithAircraft = result.entities.map((booking, index) => {
      return {
        ...booking,
        aircraftName: result.raw[index]?.aircraftName || null,
      };
    });

    // Format all bookings as trips
    return bookingsWithAircraft.map(booking => this.formatBookingAsTrip(booking));
  }

  async findPendingByUser(userId: string): Promise<any[]> {
    // Get pending bookings (not yet paid or confirmed) with aircraft name
    const result = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.passengers', 'passengers')
      .leftJoinAndSelect('booking.stops', 'stops')
      .leftJoin('aircrafts', 'aircraft', 'aircraft.id = booking.aircraftId')
      .addSelect('aircraft.name', 'aircraftName')
      .where('booking.userId = :userId', { userId })
      .andWhere('booking.bookingStatus IN (:...statuses)', { 
        statuses: ['pending', 'priced'] 
      })
      .andWhere('booking.paymentStatus = :paymentStatus', { 
        paymentStatus: 'pending' 
      })
      .orderBy('booking.createdAt', 'DESC')
      .getRawAndEntities();

    // Map aircraft names to bookings
    const pendingBookingsWithAircraft = result.entities.map((booking, index) => {
      return {
        ...booking,
        aircraftName: result.raw[index]?.aircraftName || null,
      };
    });

    return pendingBookingsWithAircraft.map(booking => this.formatBookingAsTrip(booking));
  }

  async findOne(id: string): Promise<UserTrip> {
    const trip = await this.tripRepository.findOne({ where: { id } });
    
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findByUserAndStatus(userId: string, status: string): Promise<any[]> {
    // Get all trips first
    const allTrips = await this.findByUser(userId);
    
    // Filter by the requested status
    return allTrips.filter(trip => trip.status === status);
  }

  async updateStatus(id: string, status: string): Promise<UserTrip> {
    const trip = await this.findOne(id);
    trip.status = status as TripStatus;
    return this.tripRepository.save(trip);
  }

  async rateTrip(id: string, rating?: number, review?: string, photos?: string, videos?: string) {
    const trip = await this.findOne(id);
    
    if (rating !== undefined) trip.rating = rating;
    if (review !== undefined) trip.review = review;
    if (photos !== undefined) trip.photos = photos;
    if (videos !== undefined) trip.videos = videos;
    trip.reviewDate = new Date();

    return this.tripRepository.save(trip);
  }

  async getUserTripStats(userId: string): Promise<any> {
    const trips = await this.findByUser(userId);
    
    const stats = {
      total: trips.length,
      upcoming: trips.filter(t => t.status === 'upcoming').length,
      completed: trips.filter(t => t.status === 'completed').length,
      cancelled: trips.filter(t => t.status === 'cancelled').length,
      pending: trips.filter(t => t.status === 'pending').length,
      averageRating: 0,
      totalReviews: 0,
    };

    const ratedTrips = trips.filter(t => t.rating !== null && t.rating !== undefined);
    if (ratedTrips.length > 0) {
      stats.averageRating = ratedTrips.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTrips.length;
      stats.totalReviews = ratedTrips.length;
    }

    return stats;
  }

  private generateTripId(): string {
    return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format booking as trip with calculated status
   */
  private formatBookingAsTrip(booking: any): any {
    const calculatedStatus = this.calculateTripStatus(booking);

    return {
      id: `trip_${booking.id}`,
      userId: booking.userId,
      bookingId: booking.id,
      status: calculatedStatus,
      rating: null,
      review: null,
      reviewDate: null,
      photos: null,
      videos: null,
      createdAt: booking.createdAt,
      completedAt: calculatedStatus === 'completed' ? booking.departureDateTime : null,
      cancelledAt: calculatedStatus === 'cancelled' ? booking.updatedAt : null,
      booking: {
        id: booking.id,
        userId: booking.userId,
        companyId: booking.companyId,
        aircraftId: booking.aircraftId,
        dealId: booking.dealId,
        experienceTemplateId: booking.experienceTemplateId,
        referenceNumber: booking.referenceNumber,
        bookingType: booking.bookingType,
        totalPrice: booking.totalPrice,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        originName: booking.originName,
        destinationName: booking.destinationName,
        originLatitude: booking.originLatitude,
        originLongitude: booking.originLongitude,
        destinationLatitude: booking.destinationLatitude,
        destinationLongitude: booking.destinationLongitude,
        departureDateTime: booking.departureDateTime,
        estimatedArrivalTime: booking.estimatedArrivalTime,
        estimatedFlightHours: booking.estimatedFlightHours,
        distanceNm: booking.distanceNm,
        totalAdults: booking.totalAdults,
        totalChildren: booking.totalChildren,
        onboardDining: booking.onboardDining,
        specialRequirements: booking.specialRequirements,
        adminNotes: booking.adminNotes,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        passengers: booking.passengers || [],
        stops: booking.stops || [],
        // Include aircraft name from joined data
        aircraftName: (booking as any).aircraftName || null,
      },
    };
  }

  /**
   * Calculate trip status based on booking status, payment status, and departure date
   */
  private calculateTripStatus(booking: any): string {
    // If booking is cancelled, trip is cancelled
    if (booking.bookingStatus === 'cancelled') {
      return 'cancelled';
    }
    
    // If payment is still pending, trip status is pending (regardless of booking status)
    if (booking.paymentStatus === 'pending' || booking.paymentStatus === 'failed') {
      return 'pending';
    }
    
    // If booking status is pending or priced (and payment is complete), trip is still pending
    if (booking.bookingStatus === 'pending' || booking.bookingStatus === 'priced') {
      return 'pending';
    }
    
    // If booking is confirmed AND payment is paid, check departure date
    if (booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const departureDate = new Date(booking.departureDateTime);
      departureDate.setHours(0, 0, 0, 0);
      
      // If departure date has passed, trip is completed
      if (departureDate < today) {
        return 'completed';
      }
      
      // Otherwise, trip is upcoming
      return 'upcoming';
    }
    
    // Default to pending
    return 'pending';
  }
}

