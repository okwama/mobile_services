import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Booking, BookingStatus, PaymentStatus, BookingType } from '../../entities/booking.entity';
import { CharterPassenger } from '../../entities/charter-passenger.entity';
import { BookingStop } from '../../entities/booking-stop.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CharterPassenger)
    private passengerRepository: Repository<CharterPassenger>,
    @InjectRepository(BookingStop)
    private stopRepository: Repository<BookingStop>,
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('CHARTER_SERVICE') private charterService: ClientProxy,
    @Inject('DIRECT_CHARTER_SERVICE') private directCharterService: ClientProxy,
    @Inject('YACHT_SERVICE') private yachtService: ClientProxy,
    @Inject('EXPERIENCE_SERVICE') private experienceService: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentService: ClientProxy,
    @Inject('COMMUNICATION_SERVICE') private commsService: ClientProxy,
    private dataSource: DataSource,
  ) {}

  async createBooking(dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user
      const user = await firstValueFrom(
        this.userService.send({ cmd: 'validate_user' }, { userId: dto.userId })
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Normalize booking type from mobile app client
      if (dto.bookingType === 'direct_charter') {
        dto.bookingType = BookingType.DIRECT;
      }

      // Infer bookingType from payload fields if not provided
      if (!dto.bookingType) {
        if (dto.dealId) {
          dto.bookingType = BookingType.DEAL;
        } else if (dto.aircraftId) {
          dto.bookingType = BookingType.DIRECT;
        } else if (dto.experienceTemplateId) {
          dto.bookingType = BookingType.EXPERIENCE;
        } else if (dto.yachtId) {
          dto.bookingType = BookingType.YACHT;
        }
        if (dto.bookingType) {
          console.log('[BOOKING] Inferred bookingType from payload:', dto.bookingType);
        }
      }

      // Step 2: Check availability based on booking type
      let dealOrExperience;
      console.log('[BOOKING] dto.bookingType:', dto.bookingType);
      console.log('[BOOKING] BookingType.DIRECT:', BookingType.DIRECT);
      console.log('[BOOKING] dto.aircraftId:', dto.aircraftId);
      if (dto.bookingType === BookingType.DEAL && dto.dealId) {
        dealOrExperience = await firstValueFrom(
          this.charterService.send({ cmd: 'get_charter_deal' }, { id: dto.dealId })
        );
        if (!dealOrExperience) {
          throw new NotFoundException(`Charter deal with ID ${dto.dealId} not found`);
        }
        if (dto.companyId && dealOrExperience.companyId !== dto.companyId) {
          throw new BadRequestException('Company ID does not match the charter deal');
        }
      } else if (dto.bookingType === BookingType.EXPERIENCE && dto.experienceTemplateId) {
        // For template-based experiences (fixed pricing, no schedules)
        dealOrExperience = await firstValueFrom(
          this.experienceService.send({ cmd: 'get_experience' }, { 
            id: dto.experienceTemplateId 
          })
        );
        console.log('[BOOKING] Experience template found:', {
          id: dealOrExperience?.id,
          companyId: dealOrExperience?.companyId,
          title: dealOrExperience?.title,
        });
        
        // Ensure we have required data from template
        if (!dealOrExperience) {
          throw new NotFoundException(`Experience template with ID ${dto.experienceTemplateId} not found`);
        }
        if (!dealOrExperience.companyId) {
          throw new Error(`Experience template ${dto.experienceTemplateId} missing companyId`);
        }
      } else if (dto.bookingType === BookingType.DIRECT && dto.aircraftId) {
        dealOrExperience = await firstValueFrom(
          this.directCharterService.send({ cmd: 'check_aircraft_availability' }, { 
            aircraftId: dto.aircraftId,
            startDate: dto.departureDateTime 
          })
        );
        console.log('[BOOKING] Direct charter availability check result:', JSON.stringify(dealOrExperience, null, 2));
      } else if (dto.bookingType === 'yacht' && dto.yachtId) {
        dealOrExperience = await firstValueFrom(
          this.yachtService.send({ cmd: 'check_yacht_availability' }, { 
            yachtId: dto.yachtId,
            date: dto.departureDateTime 
          })
        );
      }
      
      // Step 2.5: Extract and validate companyId & availability
      let resolvedCompanyId = dto.companyId;

      if (dto.bookingType === BookingType.DEAL && dto.dealId) {
        if (dealOrExperience) {
          resolvedCompanyId = dealOrExperience.companyId;
        }
      } else if (dto.bookingType === BookingType.EXPERIENCE && dto.experienceTemplateId) {
        if (dealOrExperience) {
          resolvedCompanyId = dealOrExperience.companyId;
          if (dto.companyId && dealOrExperience.companyId !== dto.companyId) {
            throw new BadRequestException('Company ID does not match the experience template');
          }
        }
      } else if (dto.bookingType === BookingType.DIRECT && dto.aircraftId) {
        if (!dealOrExperience) {
          throw new NotFoundException(`Aircraft with ID ${dto.aircraftId} not found`);
        }
        if (!dealOrExperience.available) {
          throw new BadRequestException(`Aircraft with ID ${dto.aircraftId} is not available: ${dealOrExperience.message || ''}`);
        }
        resolvedCompanyId = dealOrExperience.companyId;
        if (dto.companyId && dealOrExperience.companyId !== dto.companyId) {
          throw new BadRequestException('Company ID does not match the aircraft company');
        }
      } else if (dto.bookingType === 'yacht' && dto.yachtId) {
        if (!dealOrExperience || !dealOrExperience.yacht) {
          throw new NotFoundException(`Yacht with ID ${dto.yachtId} not found`);
        }
        if (!dealOrExperience.available) {
          throw new BadRequestException(`Yacht with ID ${dto.yachtId} is not available`);
        }
        resolvedCompanyId = dealOrExperience.yacht.companyId;
        if (dto.companyId && dealOrExperience.yacht.companyId !== dto.companyId) {
          throw new BadRequestException('Company ID does not match the yacht company');
        }
      }

      // Step 3: Create booking
      const referenceNumber = this.generateReferenceNumber();
      
      // Debug logging for coordinates
      console.log('[BOOKING] DTO Coordinates:', {
        originLatitude: dto.originLatitude,
        originLongitude: dto.originLongitude,
        destinationLatitude: dto.destinationLatitude,
        destinationLongitude: dto.destinationLongitude,
      });
      
      const now = new Date();
      const booking = queryRunner.manager.create(Booking, {
        userId: dto.userId,
        companyId: resolvedCompanyId,
        aircraftId: dto.aircraftId,
        bookingType: dto.bookingType,
        dealId: dto.dealId,
        experienceTemplateId: dto.experienceTemplateId,
        totalPrice: dto.totalPrice,
        taxType: dto.taxType,
        taxAmount: dto.taxAmount,
        subtotal: dto.subtotal,
        bookingStatus: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        referenceNumber,
        specialRequirements: dto.specialRequirements,
        originName: dto.originName || dealOrExperience?.originName,
        originLatitude: dto.originLatitude || dealOrExperience?.originLatitude,
        originLongitude: dto.originLongitude || dealOrExperience?.originLongitude,
        destinationName: dto.destinationName || dealOrExperience?.destinationName,
        destinationLatitude: dto.destinationLatitude || dealOrExperience?.destinationLatitude,
        destinationLongitude: dto.destinationLongitude || dealOrExperience?.destinationLongitude,
        departureDateTime: dto.departureDateTime || dealOrExperience?.date,
        totalAdults: dto.totalAdults || 1,
        totalChildren: dto.totalChildren || 0,
        onboardDining: dto.onboardDining || false,
        createdAt: now,
        updatedAt: now,
      });

      const savedBooking = await queryRunner.manager.save(booking);

      // Step 4: Add passengers
      if (dto.passengers && dto.passengers.length > 0) {
        const passengers = dto.passengers.map(p => queryRunner.manager.create(CharterPassenger, {
          bookingId: savedBooking.id,
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age,
          nationality: p.nationality,
          idPassportNumber: p.idPassportNumber,
          isUser: p.isUser || false,
        }));
        await queryRunner.manager.save(passengers);
      }

      // Step 4b: Add stops (intermediate waypoints)
      if (dto.stops && dto.stops.length > 0) {
        const stops = dto.stops.map(s => queryRunner.manager.create(BookingStop, {
          bookingId: savedBooking.id,
          stopName: s.stopName,
          latitude: s.latitude,
          longitude: s.longitude,
          datetime: s.datetime ? new Date(s.datetime) : null,
          stopOrder: s.stopOrder || 1,
          locationType: s.locationType || 'custom',
          locationCode: s.locationCode,
        }));
        await queryRunner.manager.save(stops);
        console.log(`[BOOKING] Saved ${stops.length} stops for booking ${savedBooking.id}`);
      }

      // Step 5: Initialize payment (async - don't block)
      // Skip for inquiries (totalPrice = 0) — payment is initialized after admin sets a quote price
      if (savedBooking.totalPrice && Number(savedBooking.totalPrice) > 0) {
        this.paymentService.emit('payment.initialize', {
          bookingId: savedBooking.id,
          amount: savedBooking.totalPrice,
          userId: dto.userId,
        });
      }

      // Step 6: Fetch aircraft and company details for notifications
      let aircraftDetails: any = null;
      let companyDetails: any = null;
      let experienceDetails: any = null;
      let userDetails: any = null;

      // For direct charters: fetch aircraft and company
      if (dto.aircraftId) {
        try {
          aircraftDetails = await firstValueFrom(
            this.directCharterService.send({ cmd: 'get_aircraft_details' }, { aircraftId: dto.aircraftId })
          );
          
          if (aircraftDetails?.companyId) {
            companyDetails = await firstValueFrom(
              this.directCharterService.send({ cmd: 'get_company_details' }, { companyId: aircraftDetails.companyId })
            );
          }
        } catch (error) {
          console.error('[BOOKING] Failed to fetch aircraft/company details:', error);
        }
      }

      // For experiences: fetch company from saved booking companyId
      if (dto.bookingType === BookingType.EXPERIENCE && savedBooking.companyId) {
        try {
          companyDetails = await firstValueFrom(
            this.directCharterService.send({ cmd: 'get_company_details' }, { companyId: savedBooking.companyId })
          );
          experienceDetails = dealOrExperience; // Use the experience template we already fetched
          console.log('[BOOKING] Fetched company details for experience:', {
            companyId: savedBooking.companyId,
            companyEmail: companyDetails?.email,
            companyPhone: companyDetails?.mobileNumber,
          });
        } catch (error) {
          console.error('[BOOKING] Failed to fetch company details for experience:', error);
        }
      }

      // Step 7: Send notification (async)
      this.commsService.emit('booking.created', {
        bookingId: savedBooking.id,
        referenceNumber: savedBooking.referenceNumber,
        userId: dto.userId,
        bookingType: dto.bookingType,
        // User info
        customerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Customer',
        customerEmail: user?.email || '',
        // Aircraft/Experience info
        aircraftName: aircraftDetails?.name || null,
        experienceTitle: experienceDetails?.title || null,
        // Company info (for email/SMS to company)
        companyEmail: companyDetails?.email || null,
        companyPhone: companyDetails?.mobileNumber || null,
        // Booking details
        origin: savedBooking.originName,
        destination: savedBooking.destinationName,
        departureDate: savedBooking.departureDateTime,
        passengerCount: savedBooking.totalAdults + savedBooking.totalChildren,
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        data: {
          ...savedBooking,
          id: savedBooking.id,
          referenceNumber: savedBooking.referenceNumber,
        },
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['passengers', 'stops'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10) {
    const [bookings, total] = await this.bookingRepository.findAndCount({
      where: { userId },
      relations: ['passengers'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: number, status: string) {
    const booking = await this.findOne(id);
    booking.bookingStatus = status as BookingStatus;
    return this.bookingRepository.save(booking);
  }

  async updatePaymentStatus(id: number, paymentStatus: string) {
    const booking = await this.findOne(id);
    booking.paymentStatus = paymentStatus as PaymentStatus;
    // If payment is complete and booking was priced or pending, mark as confirmed
    if (paymentStatus === 'paid' && 
        (booking.bookingStatus === BookingStatus.PRICED || booking.bookingStatus === BookingStatus.PENDING)) {
      booking.bookingStatus = BookingStatus.CONFIRMED;
    }
    return this.bookingRepository.save(booking);
  }

  async setInquiryQuote(id: number, totalPrice: number, adminNotes?: string) {
    const booking = await this.findOne(id);

    if (booking.bookingStatus !== BookingStatus.PENDING) {
      throw new BadRequestException(`Booking ${id} is not in pending/inquiry state`);
    }

    booking.totalPrice = totalPrice;
    booking.bookingStatus = BookingStatus.PRICED;
    if (adminNotes) booking.adminNotes = adminNotes;

    const updated = await this.bookingRepository.save(booking);

    // Fetch user details so the comms service can email/push the customer directly
    let customerEmail = '';
    let customerName = 'Customer';
    try {
      const user = await firstValueFrom(
        this.userService.send({ cmd: 'validate_user' }, { userId: updated.userId })
      );
      if (user) {
        customerEmail = user.email || '';
        customerName = user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : (user.firstName || 'Customer');
      }
    } catch {
      // Non-fatal — notification degrades gracefully
    }

    // Notify the user their quote is ready
    this.commsService.emit('booking.quoted', {
      bookingId: updated.id,
      referenceNumber: updated.referenceNumber,
      userId: updated.userId,
      customerEmail,
      customerName,
      totalPrice,
      origin: updated.originName,
      destination: updated.destinationName,
      departureDate: updated.departureDateTime,
      adminNotes,
    });

    // Now initialize payment since we have a real price
    this.paymentService.emit('payment.initialize', {
      bookingId: updated.id,
      amount: totalPrice,
      userId: updated.userId,
    });

    return { success: true, data: updated };
  }

  async cancelBooking(id: number, reason?: string) {
    const booking = await this.findOne(id);
    
    booking.bookingStatus = BookingStatus.CANCELLED;
    await this.bookingRepository.save(booking);

    // Emit cancellation event
    this.commsService.emit('booking.cancelled', {
      bookingId: id,
      referenceNumber: booking.referenceNumber,
      reason,
    });

    return { success: true, booking };
  }

  private generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AC${year}${month}${day}${random}`;
  }
}

