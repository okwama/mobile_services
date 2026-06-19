# Air Charters Microservices Migration Plan

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Target Architecture](#target-architecture)
4. [Service Decomposition](#service-decomposition)
5. [Migration Strategy](#migration-strategy)
6. [Implementation Phases](#implementation-phases)
7. [Technical Specifications](#technical-specifications)
8. [Database Strategy](#database-strategy)
9. [Communication Patterns](#communication-patterns)
10. [Infrastructure Requirements](#infrastructure-requirements)
11. [Testing Strategy](#testing-strategy)
12. [Rollback Plan](#rollback-plan)
13. [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

**Objective:** Transform the Air Charters monolithic backend into a microservices architecture for improved scalability, maintainability, and deployment flexibility.

**Approach:** Incremental migration using the Strangler Fig Pattern - gradually replace monolithic components while maintaining system stability.

**Duration:** 8-12 weeks (phased approach)

**Risk Level:** Medium (mitigated through phased rollout)

---

## Current Architecture

### Monolithic Structure
```
┌─────────────────────────────────────────────────┐
│         NestJS Monolith (Port 5008)             │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  15 Modules (Tightly Coupled)            │  │
│  │  - Auth, Users, Bookings, Payments       │  │
│  │  - Charter Deals, Wallet, Trips          │  │
│  │  - Locations, Aircraft, Direct Charter   │  │
│  │  - Booking Inquiries, Google Earth       │  │
│  │  - Amenities, Commission, Experiences    │  │
│  │  - SMS, Email                            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Single MySQL Database (TypeORM)         │  │
│  │  - 35+ Tables                            │  │
│  │  - Shared Connection Pool (20 conn)      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Current Issues
- **Scaling Limitations:** Cannot scale individual components
- **Deployment Risk:** Single deployment affects entire system
- **Development Bottlenecks:** All teams work in same codebase
- **Technology Lock-in:** All modules must use same tech stack
- **Database Contention:** Shared connection pool under load

---

## Target Architecture

### Microservices Architecture
```
                    ┌─────────────────────────────┐
                    │   API Gateway (Port 5008)   │
                    │   - JWT Authentication      │
                    │   - Request Routing         │
                    │   - Rate Limiting           │
                    │   - Load Balancing          │
                    └──────────────┬──────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                │
        ┌─────────▼─────────┐ ┌───▼────────┐ ┌────▼──────────┐
        │  User Service     │ │  Booking   │ │   Payment     │
        │  Port: 3001       │ │  Service   │ │   Service     │
        │  - Auth           │ │  Port:3002 │ │   Port: 3003  │
        │  - Users          │ │  -Bookings │ │   - Payments  │
        │  - Passengers     │ │  -Inquiries│ │   -Commission │
        │  - Wallet         │ │  - Trips   │ │   - Ledger    │
        │                   │ │  - Direct  │ │   - Stripe    │
        │  DB: users_db     │ │            │ │   - Paystack  │
        └───────────────────┘ │  DB: book  │ │   - MPesa     │
                              │  _db       │ │               │
        ┌───────────────────┐ └────────────┘ │  DB: pay_db   │
        │ Charter Service   │                └───────────────┘
        │ Port: 3004        │ ┌────────────────────────────┐
        │ - Charter Deals   │ │  Communication Service     │
        │ - Aircraft        │ │  Port: 3005                │
        │ - Availability    │ │  - SMS (Twilio)            │
        │ - Amenities       │ │  - Email (Resend)          │
        │ - Experiences     │ │  - Notifications           │
        │                   │ │                            │
        │ DB: charter_db    │ │  DB: comms_db (logs only)  │
        └───────────────────┘ └────────────────────────────┘
                              
        ┌───────────────────────────────────────────────────┐
        │         Location Service (Port: 3006)             │
        │         - Locations                               │
        │         - Google Earth Engine                     │
        │         DB: location_db                           │
        └───────────────────────────────────────────────────┘

        ┌───────────────────────────────────────────────────┐
        │         Redis Message Broker                      │
        │         - Inter-service Communication             │
        │         - Event Bus                               │
        │         - Caching Layer                           │
        └───────────────────────────────────────────────────┘
```

---

## Service Decomposition

### 1. User Service (Port 3001)
**Responsibility:** User identity, authentication, and wallet management

**Modules:**
- `auth` - Authentication, JWT, password management
- `users` - User CRUD, profiles
- `passengers` - Passenger management
- `wallet` - Wallet transactions, balance

**Database Tables:**
- users
- user_profiles
- user_trips
- user_files
- user_events
- passengers
- wallet_transactions
- password_reset_tokens

**API Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/passengers
POST   /api/passengers
GET    /api/wallet/balance
POST   /api/wallet/deposit
```

**Dependencies:**
- OUT: Communication Service (send emails/SMS)
- OUT: Payment Service (wallet top-ups)

---

### 2. Booking Service (Port 3002)
**Responsibility:** All booking-related operations

**Modules:**
- `bookings` - Charter bookings
- `booking-inquiries` - Inquiry management
- `direct-charter` - Direct charter bookings
- `trips` - Trip scheduling and management

**Database Tables:**
- bookings
- booking_timeline
- booking_stops
- booking_inquiries
- inquiry_stops
- user_trips

**API Endpoints:**
```
POST   /api/bookings
GET    /api/bookings/:id
GET    /api/bookings/user/:userId
PUT    /api/bookings/:id/status
POST   /api/inquiries
GET    /api/inquiries/:id
POST   /api/direct-charter/search
POST   /api/direct-charter/book
GET    /api/trips
```

**Dependencies:**
- OUT: User Service (validate users)
- OUT: Charter Service (check availability)
- OUT: Payment Service (process payments)
- OUT: Communication Service (confirmations)

---

### 3. Payment Service (Port 3003)
**Responsibility:** Payment processing and financial transactions

**Modules:**
- `payments` - Unified payment processing
- `commission` - Commission calculation and distribution
- Transaction ledger management

**Database Tables:**
- payments
- transaction_ledger
- platform_commission
- commission_tiers
- company_commission
- commission_history
- company_payment_accounts

**API Endpoints:**
```
POST   /api/payments/initialize
POST   /api/payments/verify
GET    /api/payments/:reference
POST   /api/payments/stripe/webhook
POST   /api/payments/paystack/webhook
POST   /api/payments/mpesa/callback
GET    /api/commission/calculate/:bookingId
POST   /api/commission/distribute
```

**Dependencies:**
- OUT: User Service (validate users)
- OUT: Booking Service (booking details)
- OUT: Communication Service (payment confirmations)
- EXTERNAL: Stripe, Paystack, MPesa APIs

---

### 4. Charter Service (Port 3004)
**Responsibility:** Charter deals and aircraft management

**Modules:**
- `charter-deals` - Charter deal management
- `aircraft-availability` - Aircraft scheduling
- `amenities` - Aircraft amenities
- `experiences` - Experience templates

**Database Tables:**
- charter_deals
- charters_companies
- companies
- aircraft (charter)
- aircraft (booking)
- aircraft_availability
- aircraft_images
- aircraft_calendar
- aircraft_amenities
- charter_deal_amenities
- amenities
- aircraft_type_image_placeholders
- experience_templates
- experience_images

**API Endpoints:**
```
GET    /api/charter-deals
GET    /api/charter-deals/:id
POST   /api/charter-deals/filter
GET    /api/aircraft/:id/availability
POST   /api/aircraft/:id/availability
GET    /api/amenities
POST   /api/amenities
GET    /api/experiences
```

**Dependencies:**
- OUT: Booking Service (availability checks)
- OUT: Location Service (route information)

---

### 5. Communication Service (Port 3005)
**Responsibility:** All external communications

**Modules:**
- `sms` - SMS via Twilio
- `email` - Email via Resend

**Database Tables:**
- communication_logs (new - for audit)

**API Endpoints:**
```
POST   /api/comms/sms/send
POST   /api/comms/email/send
GET    /api/comms/logs/:userId
```

**Message Patterns:**
```typescript
@EventPattern('booking_confirmed')
@EventPattern('payment_received')
@EventPattern('user_registered')
```

**Dependencies:**
- EXTERNAL: Twilio, Resend APIs

---

### 6. Location Service (Port 3006)
**Responsibility:** Geographic and location data

**Modules:**
- `locations` - Location management
- `google-earth-engine` - Mapping integration

**Database Tables:**
- locations

**API Endpoints:**
```
GET    /api/locations/search
GET    /api/locations/:id
GET    /api/geo/route-info
```

**Dependencies:**
- EXTERNAL: Google Earth Engine API

---

## Migration Strategy

### Approach: Strangler Fig Pattern

**Phase-by-phase migration** where new microservices gradually replace monolith functionality while both run simultaneously.

```
Week 1-2:  [Monolith 100%] → [Microservices 0%]
Week 3-4:  [Monolith 80%]  → [Microservices 20%]  (User Service)
Week 5-6:  [Monolith 60%]  → [Microservices 40%]  (+Charter Service)
Week 7-8:  [Monolith 40%]  → [Microservices 60%]  (+Location, Comms)
Week 9-10: [Monolith 20%]  → [Microservices 80%]  (+Booking, Payment)
Week 11-12:[Monolith 0%]   → [Microservices 100%] (Decommission)
```

### Key Principles
1. **Zero Downtime:** Both systems run in parallel during migration
2. **Feature Flag Control:** Toggle between monolith/microservice per endpoint
3. **Data Consistency:** Shared database initially, split later
4. **Rollback Ready:** Can revert to monolith at any phase
5. **Incremental Testing:** Full test suite after each service migration

---

## Implementation Phases

### **Phase 0: Infrastructure Setup** (Week 1)
**Duration:** 5 days

#### Tasks:
- [ ] Install microservices dependencies
- [ ] Setup Redis server for message broker
- [ ] Convert to NestJS monorepo structure
- [ ] Create shared libraries (`libs/common`)
- [ ] Setup API Gateway skeleton
- [ ] Configure Docker Compose for local development
- [ ] Setup environment variables per service
- [ ] Create migration tracking system

#### Deliverables:
```
air_backend/
├── apps/
│   ├── api-gateway/
│   └── monolith/ (current app moved here)
├── libs/
│   ├── common/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   └── decorators/
│   └── database/
├── docker-compose.yml
└── nest-cli.json (monorepo config)
```

#### Success Criteria:
- ✅ Monorepo builds successfully
- ✅ API Gateway routes to monolith
- ✅ Redis connection established
- ✅ Docker Compose runs all services

---

### **Phase 1: User Service Migration** (Week 2-3)
**Duration:** 10 days

#### Why User Service First?
- Most other services depend on it (authentication)
- Well-defined boundaries
- Critical path for testing inter-service communication

#### Tasks:
- [ ] Create `apps/user-service` structure
- [ ] Move Auth, Users, Passengers, Wallet modules
- [ ] Implement Redis transport layer
- [ ] Create message patterns for user operations
- [ ] Update API Gateway to route user requests
- [ ] Implement JWT validation in gateway
- [ ] Setup user service database connection
- [ ] Create integration tests
- [ ] Deploy to staging environment

#### Code Changes:

**Gateway Controller:**
```typescript
// apps/api-gateway/src/controllers/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy
  ) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.send(
      { cmd: 'get_user_profile' },
      { userId: req.user.id }
    );
  }
}
```

**User Service Handler:**
```typescript
// apps/user-service/src/users/users.controller.ts
@Controller()
export class UsersController {
  @MessagePattern({ cmd: 'get_user_profile' })
  async getProfile(data: { userId: number }) {
    return this.usersService.findById(data.userId);
  }
}
```

#### Success Criteria:
- ✅ User service runs independently on port 3001
- ✅ API Gateway successfully routes auth requests
- ✅ JWT authentication works across services
- ✅ All user-related tests pass
- ✅ Response time < 200ms (added network overhead)

---

### **Phase 2: Charter & Location Services** (Week 4-5)
**Duration:** 10 days

#### Why These Services?
- Independent domains with minimal cross-dependencies
- Can be developed in parallel
- Low risk (read-heavy operations)

#### Tasks:

**Charter Service:**
- [ ] Create `apps/charter-service`
- [ ] Move CharterDeals, Aircraft, Amenities, Experiences modules
- [ ] Implement availability check message patterns
- [ ] Setup charter database schema/views
- [ ] Create caching layer for charter deals
- [ ] Update API Gateway routes

**Location Service:**
- [ ] Create `apps/location-service`
- [ ] Move Locations and GoogleEarthEngine modules
- [ ] Implement location search patterns
- [ ] Setup location database
- [ ] Cache popular locations
- [ ] Update API Gateway routes

#### Message Patterns:
```typescript
// Used by Booking Service
this.charterService.send('check_availability', {
  aircraftId: 123,
  startDate: '2025-01-15',
  endDate: '2025-01-20'
});

this.locationService.send('get_route_info', {
  origin: 'JKIA',
  destination: 'Mombasa'
});
```

#### Success Criteria:
- ✅ Both services run independently (3004, 3006)
- ✅ Charter deals API fully functional
- ✅ Location search performs well
- ✅ Cache hit ratio > 70%
- ✅ All existing tests pass

---

### **Phase 3: Communication Service** (Week 5-6)
**Duration:** 5 days

#### Why This Service?
- Event-driven architecture ideal for notifications
- Can be migrated quickly
- Low coupling with other services

#### Tasks:
- [ ] Create `apps/communication-service`
- [ ] Move SMS and Email modules
- [ ] Implement event patterns (not request-response)
- [ ] Create communication logs table
- [ ] Setup email templates in service
- [ ] Add retry mechanism for failed sends
- [ ] Monitor external API calls (Twilio, Resend)

#### Event Patterns:
```typescript
// Other services emit events
@Injectable()
export class BookingsService {
  async confirmBooking(id: number) {
    // ... booking logic
    
    this.eventEmitter.emit('booking.confirmed', {
      bookingId: id,
      userId: booking.userId,
      userEmail: booking.user.email,
      confirmationNumber: booking.confirmationNumber
    });
  }
}

// Communication service listens
@Controller()
export class EmailController {
  @EventPattern('booking.confirmed')
  async handleBookingConfirmed(data: BookingConfirmedEvent) {
    await this.emailService.sendBookingConfirmation(data);
  }
}
```

#### Success Criteria:
- ✅ All emails/SMS sent successfully
- ✅ Event delivery guaranteed (Redis persistence)
- ✅ Failed messages retry automatically
- ✅ Communication logs created for audit
- ✅ No impact on main request flow

---

### **Phase 4: Booking Service** (Week 7-8)
**Duration:** 10 days

#### Complexity: HIGH
- Most interconnected service
- Complex business logic
- Multiple dependencies

#### Tasks:
- [ ] Create `apps/booking-service`
- [ ] Move Bookings, BookingInquiries, DirectCharter, Trips modules
- [ ] Implement orchestration for multi-service bookings
- [ ] Add distributed transaction handling (Saga pattern)
- [ ] Create booking timeline tracking
- [ ] Setup booking database schema
- [ ] Implement compensation logic for failures
- [ ] Add extensive integration tests

#### Saga Pattern Implementation:
```typescript
// Booking creation saga
async createBooking(dto: CreateBookingDto) {
  const saga = new BookingSaga();
  
  try {
    // Step 1: Validate user
    const user = await this.userService.send('validate_user', {
      userId: dto.userId
    }).toPromise();
    saga.addCompensation(() => this.revertUserValidation(user));
    
    // Step 2: Check aircraft availability
    const availability = await this.charterService.send(
      'reserve_aircraft',
      { aircraftId: dto.aircraftId, dates: dto.dates }
    ).toPromise();
    saga.addCompensation(() => this.releaseAircraft(availability));
    
    // Step 3: Create booking record
    const booking = await this.bookingRepo.save(dto);
    saga.addCompensation(() => this.deleteBooking(booking.id));
    
    // Step 4: Initialize payment
    const payment = await this.paymentService.send(
      'initialize_payment',
      { bookingId: booking.id, amount: dto.amount }
    ).toPromise();
    
    return { booking, payment };
    
  } catch (error) {
    await saga.compensate(); // Rollback all steps
    throw error;
  }
}
```

#### Success Criteria:
- ✅ All booking flows work end-to-end
- ✅ Failed bookings rollback cleanly
- ✅ No orphaned reservations
- ✅ Booking timeline accurate
- ✅ Performance within 500ms for simple bookings

---

### **Phase 5: Payment Service** (Week 9-10)
**Duration:** 10 days

#### Complexity: HIGH
- Financial transactions (zero-error tolerance)
- Multiple payment providers
- PCI compliance considerations

#### Tasks:
- [ ] Create `apps/payment-service`
- [ ] Move Payments and Commission modules
- [ ] Implement idempotent payment processing
- [ ] Setup webhook handlers (Stripe, Paystack, MPesa)
- [ ] Create transaction ledger service
- [ ] Implement commission calculation
- [ ] Add payment reconciliation logic
- [ ] Setup payment database with encryption
- [ ] Implement extensive audit logging

#### Payment Flow:
```typescript
@Controller()
export class PaymentController {
  @MessagePattern({ cmd: 'initialize_payment' })
  async initializePayment(data: InitializePaymentDto) {
    // Idempotency check
    const existing = await this.findByIdempotencyKey(data.idempotencyKey);
    if (existing) return existing;
    
    // Create payment record (pending)
    const payment = await this.paymentRepo.save({
      ...data,
      status: 'pending',
      idempotencyKey: data.idempotencyKey
    });
    
    // Initialize with provider
    let providerResponse;
    switch (data.provider) {
      case 'stripe':
        providerResponse = await this.stripeService.initialize(payment);
        break;
      case 'paystack':
        providerResponse = await this.paystackService.initialize(payment);
        break;
      case 'mpesa':
        providerResponse = await this.mpesaService.initialize(payment);
        break;
    }
    
    // Update with provider details
    await this.paymentRepo.update(payment.id, {
      providerReference: providerResponse.reference,
      providerData: providerResponse
    });
    
    // Emit event
    this.eventEmitter.emit('payment.initialized', payment);
    
    return payment;
  }
  
  @MessagePattern({ cmd: 'verify_payment' })
  async verifyPayment(data: { reference: string }) {
    const payment = await this.findByReference(data.reference);
    
    // Verify with provider
    const verified = await this.verifyWithProvider(payment);
    
    if (verified.status === 'success') {
      // Update payment
      await this.paymentRepo.update(payment.id, {
        status: 'completed',
        completedAt: new Date()
      });
      
      // Create ledger entries
      await this.ledgerService.recordPayment(payment);
      
      // Calculate and distribute commission
      await this.commissionService.process(payment);
      
      // Emit event
      this.eventEmitter.emit('payment.completed', payment);
    }
    
    return payment;
  }
}
```

#### Success Criteria:
- ✅ All payment methods work correctly
- ✅ Zero duplicate payments (idempotency)
- ✅ Webhooks processed reliably
- ✅ Commission calculated accurately
- ✅ Audit logs complete
- ✅ PCI compliance maintained

---

### **Phase 6: Database Split** (Week 11)
**Duration:** 7 days

#### Current State: Shared Database
#### Target State: Database Per Service

#### Migration Strategy:
```sql
-- Create separate databases
CREATE DATABASE users_db;
CREATE DATABASE bookings_db;
CREATE DATABASE payments_db;
CREATE DATABASE charters_db;
CREATE DATABASE communications_db;
CREATE DATABASE locations_db;

-- Migrate data with zero downtime
-- Use read replicas and gradual cutover
```

#### Tasks:
- [ ] Analyze cross-database queries
- [ ] Create database migration scripts
- [ ] Setup database replication
- [ ] Migrate tables to respective databases
- [ ] Update service database connections
- [ ] Implement data synchronization (temporary)
- [ ] Remove cross-database foreign keys
- [ ] Test data consistency
- [ ] Cutover during low-traffic window

#### Data Migration Example:
```typescript
// Migration script
async function migrateUserData() {
  const sourceConnection = await createConnection('monolith_db');
  const targetConnection = await createConnection('users_db');
  
  // Copy users table
  const users = await sourceConnection
    .getRepository(User)
    .find();
  
  await targetConnection
    .getRepository(User)
    .save(users);
  
  // Verify counts match
  const sourceCount = await sourceConnection
    .getRepository(User)
    .count();
  const targetCount = await targetConnection
    .getRepository(User)
    .count();
  
  if (sourceCount !== targetCount) {
    throw new Error('Data migration failed: count mismatch');
  }
  
  console.log(`Migrated ${sourceCount} users successfully`);
}
```

#### Success Criteria:
- ✅ All services use separate databases
- ✅ Data integrity maintained
- ✅ No data loss
- ✅ Performance not degraded
- ✅ Rollback tested

---

### **Phase 7: Optimization & Monitoring** (Week 12)
**Duration:** 7 days

#### Tasks:
- [ ] Setup distributed tracing (Jaeger/OpenTelemetry)
- [ ] Implement service health checks
- [ ] Add performance monitoring
- [ ] Configure auto-scaling rules
- [ ] Optimize Redis usage
- [ ] Implement circuit breakers
- [ ] Add request timeout handling
- [ ] Setup centralized logging (ELK/Datadog)
- [ ] Create monitoring dashboards
- [ ] Load testing all services
- [ ] Document service APIs (Swagger per service)
- [ ] Create runbooks for operations

#### Circuit Breaker Pattern:
```typescript
import { CircuitBreaker } from '@nestjs/common';

@Injectable()
export class BookingService {
  private charterServiceBreaker = new CircuitBreaker({
    timeout: 3000,
    errorThreshold: 50,
    resetTimeout: 30000
  });
  
  async checkAvailability(aircraftId: number) {
    return this.charterServiceBreaker.execute(async () => {
      return this.charterService
        .send('check_availability', { aircraftId })
        .toPromise();
    }, {
      fallback: async () => {
        // Fallback to cached availability
        return this.cacheService.get(`availability:${aircraftId}`);
      }
    });
  }
}
```

#### Success Criteria:
- ✅ Distributed tracing working
- ✅ All services monitored
- ✅ Circuit breakers prevent cascading failures
- ✅ Load tests pass (1000 concurrent users)
- ✅ Mean response time < 300ms
- ✅ Error rate < 0.1%

---

## Technical Specifications

### Transport Layer: Redis

**Why Redis?**
- Already in dependencies
- Supports both request-response and pub/sub
- Built-in persistence
- High performance
- Simple setup

**Configuration:**
```typescript
// Shared Redis config
export const REDIS_CONFIG = {
  transport: Transport.REDIS,
  options: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    retryAttempts: 5,
    retryDelay: 1000,
  }
};
```

### Message Patterns

#### Request-Response (Synchronous)
```typescript
// Caller
const result = await firstValueFrom(
  this.client.send({ cmd: 'operation_name' }, payload)
);

// Handler
@MessagePattern({ cmd: 'operation_name' })
async handleOperation(payload: any) {
  return result;
}
```

#### Event-Based (Asynchronous)
```typescript
// Emitter
this.client.emit('event_name', payload);

// Listener
@EventPattern('event_name')
async handleEvent(payload: any) {
  // Process without responding
}
```

### API Gateway Pattern

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // CORS, validation, etc. (same as monolith)
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(5008);
  console.log('🚀 API Gateway running on port 5008');
}
bootstrap();
```

```typescript
// apps/api-gateway/src/api-gateway.module.ts
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'BOOKING_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'PAYMENT_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'CHARTER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'LOCATION_SERVICE',
        ...REDIS_CONFIG,
      },
    ]),
  ],
  controllers: [
    UsersController,
    BookingsController,
    PaymentsController,
    CharterDealsController,
    LocationsController,
  ],
})
export class ApiGatewayModule {}
```

### Shared Libraries

```typescript
// libs/common/src/dto/index.ts
export * from './user.dto';
export * from './booking.dto';
export * from './payment.dto';

// libs/common/src/interfaces/index.ts
export * from './user.interface';
export * from './booking.interface';

// libs/common/src/decorators/index.ts
export * from './current-user.decorator';
export * from './roles.decorator';
```

---

## Database Strategy

### Phase 1: Shared Database (Weeks 1-10)
- All services connect to same MySQL database
- Reduces initial complexity
- Allows focus on service separation

### Phase 2: Logical Separation (Week 11)
- Create database views per service
- Services only access their views
- Prepare for physical split

### Phase 3: Physical Separation (Week 11-12)
- Migrate to separate databases
- Implement data synchronization where needed
- Remove cross-database dependencies

### Data Consistency Strategies

**Eventual Consistency:**
```typescript
// When data needs to be in multiple services
@EventPattern('user.updated')
async handleUserUpdated(user: User) {
  // Update local cache
  await this.cacheService.set(`user:${user.id}`, user);
}
```

**Distributed Transactions (Saga):**
```typescript
class BookingSaga {
  private compensations: Array<() => Promise<void>> = [];
  
  addCompensation(fn: () => Promise<void>) {
    this.compensations.push(fn);
  }
  
  async compensate() {
    for (const compensation of this.compensations.reverse()) {
      await compensation();
    }
  }
}
```

---

## Communication Patterns

### 1. Synchronous Communication (Request-Response)

**When to Use:**
- Immediate response needed
- Transactional consistency required
- User is waiting

**Example:**
```typescript
// Get user profile
const user = await this.userService
  .send({ cmd: 'get_user' }, { userId: 123 })
  .toPromise();
```

### 2. Asynchronous Communication (Events)

**When to Use:**
- Fire-and-forget operations
- Multiple services need to react
- Operation can be delayed

**Example:**
```typescript
// Booking confirmed - send email, SMS, update stats
this.eventBus.emit('booking.confirmed', booking);
```

### 3. Event Sourcing (Advanced)

**When to Use:**
- Complete audit trail needed
- Time-travel queries required
- Complex business logic

**Example:**
```typescript
// Payment events
this.eventStore.append('payment_initialized', payment);
this.eventStore.append('payment_processing', payment);
this.eventStore.append('payment_completed', payment);

// Reconstruct payment state from events
const paymentState = await this.eventStore.replay(paymentId);
```

---

## Infrastructure Requirements

### Local Development (Docker Compose)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Message Broker
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Databases (shared initially)
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: air_charters
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  # API Gateway
  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - "5008:5008"
    depends_on:
      - redis
      - user-service
      - booking-service
    environment:
      - REDIS_HOST=redis
      - USER_SERVICE_HOST=user-service
      - BOOKING_SERVICE_HOST=booking-service

  # User Service
  user-service:
    build:
      context: .
      dockerfile: apps/user-service/Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - redis
      - mysql
    environment:
      - REDIS_HOST=redis
      - DB_HOST=mysql

  # Booking Service
  booking-service:
    build:
      context: .
      dockerfile: apps/booking-service/Dockerfile
    ports:
      - "3002:3002"
    depends_on:
      - redis
      - mysql
    environment:
      - REDIS_HOST=redis
      - DB_HOST=mysql

  # Payment Service
  payment-service:
    build:
      context: .
      dockerfile: apps/payment-service/Dockerfile
    ports:
      - "3003:3003"
    depends_on:
      - redis
      - mysql
    environment:
      - REDIS_HOST=redis
      - DB_HOST=mysql
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}

  # Charter Service
  charter-service:
    build:
      context: .
      dockerfile: apps/charter-service/Dockerfile
    ports:
      - "3004:3004"
    depends_on:
      - redis
      - mysql

  # Communication Service
  communication-service:
    build:
      context: .
      dockerfile: apps/communication-service/Dockerfile
    ports:
      - "3005:3005"
    depends_on:
      - redis
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - RESEND_API_KEY=${RESEND_API_KEY}

  # Location Service
  location-service:
    build:
      context: .
      dockerfile: apps/location-service/Dockerfile
    ports:
      - "3006:3006"
    depends_on:
      - redis
      - mysql

volumes:
  redis_data:
  mysql_data:
```

### Production Infrastructure

**Kubernetes Deployment:**
```yaml
# k8s/user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: air-charters/user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: REDIS_HOST
          value: redis-service
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Testing Strategy

### Unit Tests
```typescript
// apps/user-service/src/users/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should find user by id', async () => {
    const user = { id: 1, email: 'test@example.com' };
    jest.spyOn(repository, 'findOne').mockResolvedValue(user);

    const result = await service.findById(1);
    expect(result).toEqual(user);
  });
});
```

### Integration Tests
```typescript
// apps/booking-service/test/booking.e2e-spec.ts
describe('Booking Service (e2e)', () => {
  let app: INestMicroservice;
  let userServiceMock: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BookingServiceModule],
    })
      .overrideProvider('USER_SERVICE')
      .useValue(createMockClient())
      .compile();

    app = moduleRef.createNestMicroservice({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });

    await app.listen();
  });

  it('should create booking', async () => {
    const booking = await app
      .get(BookingService)
      .createBooking({
        userId: 1,
        aircraftId: 1,
        startDate: '2025-01-15',
      });

    expect(booking).toHaveProperty('id');
    expect(booking.status).toBe('pending');
  });
});
```

### Contract Tests
```typescript
// Verify service contracts don't break
describe('User Service Contract', () => {
  it('get_user message should return user with required fields', async () => {
    const response = await userService
      .send({ cmd: 'get_user' }, { userId: 1 })
      .toPromise();

    expect(response).toMatchSchema({
      type: 'object',
      required: ['id', 'email', 'firstName', 'lastName'],
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    });
  });
});
```

### Load Tests
```javascript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m',
};

export default function () {
  const res = http.get('http://localhost:5008/api/charter-deals');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Rollback Plan

### Service-Level Rollback

**If a microservice fails:**
1. Route traffic back to monolith endpoint (feature flag)
2. Investigate issue
3. Fix and redeploy
4. Re-enable microservice routing

```typescript
// Feature flag in API Gateway
@Get('users/profile')
async getProfile(@Request() req) {
  if (this.configService.get('USE_USER_MICROSERVICE') === 'true') {
    // Route to microservice
    return this.userService.send({ cmd: 'get_profile' }, req.user);
  } else {
    // Fallback to monolith
    return this.monolithService.send({ cmd: 'get_profile' }, req.user);
  }
}
```

### Database Rollback

**If database split fails:**
1. Revert service database connections to shared database
2. Drop newly created databases
3. Verify all services working
4. Re-plan database migration

### Full Rollback

**If migration must be abandoned:**
1. Route all traffic to monolith
2. Shut down microservices
3. Restore monolith to full production
4. Post-mortem analysis

---

## Timeline & Milestones

```
Week 1   [==============] Infrastructure Setup
Week 2-3 [==============] User Service Migration
Week 4-5 [==============] Charter & Location Services
Week 5-6 [======]         Communication Service
Week 7-8 [==============] Booking Service
Week 9-10[==============] Payment Service
Week 11  [==============] Database Split
Week 12  [==============] Optimization & Monitoring

Total: 12 weeks (3 months)
```

### Key Milestones

**Week 1:** ✅ Monorepo structure ready
**Week 3:** ✅ First microservice live (User Service)
**Week 6:** ✅ Half of services migrated
**Week 10:** ✅ All services migrated
**Week 11:** ✅ Database per service
**Week 12:** ✅ Production-ready

---

## Success Metrics

### Performance
- **Response Time:** P95 < 500ms (vs current ~300ms)
- **Throughput:** 1000 req/sec (vs current ~600 req/sec)
- **Error Rate:** < 0.1%

### Reliability
- **Uptime:** 99.9%
- **MTTR:** < 15 minutes
- **Data Consistency:** 100%

### Development
- **Deployment Frequency:** Daily per service (vs weekly monolith)
- **Lead Time:** < 1 hour (vs 1 day)
- **Change Failure Rate:** < 5%

### Infrastructure
- **Resource Utilization:** 70-80%
- **Auto-scaling:** Services scale independently
- **Cost:** ±10% of current infrastructure cost

---

## Next Steps

1. **Review this plan** with team
2. **Get stakeholder approval**
3. **Start Phase 0** (Infrastructure Setup)
4. **Set up project tracking** (Jira/GitHub Projects)
5. **Assign team members** to services
6. **Schedule weekly sync meetings**

---

## References

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

## Appendix

### A. Environment Variables Template

```bash
# .env.template

# API Gateway
PORT=5008

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# User Service
USER_SERVICE_PORT=3001
USER_DB_HOST=localhost
USER_DB_PORT=3306
USER_DB_NAME=users_db

# Booking Service
BOOKING_SERVICE_PORT=3002
BOOKING_DB_NAME=bookings_db

# Payment Service
PAYMENT_SERVICE_PORT=3003
PAYMENT_DB_NAME=payments_db
STRIPE_SECRET_KEY=
PAYSTACK_SECRET_KEY=
MPESA_CONSUMER_KEY=

# Charter Service
CHARTER_SERVICE_PORT=3004
CHARTER_DB_NAME=charters_db

# Communication Service
COMMUNICATION_SERVICE_PORT=3005
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
RESEND_API_KEY=

# Location Service
LOCATION_SERVICE_PORT=3006
LOCATION_DB_NAME=locations_db
GOOGLE_EARTH_ENGINE_API_KEY=
```

### B. Monitoring Dashboard

**Key Metrics to Track:**
- Request rate per service
- Response time distribution
- Error rate by endpoint
- Database connection pool usage
- Redis memory usage
- Message queue depth
- Service health status
- CPU/Memory usage per service

### C. Cost Analysis

**Current Infrastructure:**
- Single server: $200/month
- Database: $100/month
- **Total: $300/month**

**Projected Microservices Infrastructure:**
- API Gateway: $50/month
- 6 Microservices: 6 × $40 = $240/month
- Redis: $30/month
- 6 Databases (or single with more resources): $150/month
- **Total: $470/month (+57%)**

**ROI:**
- Improved scalability (scale what you need)
- Faster deployments (reduced downtime)
- Better fault isolation (one service down ≠ entire system down)
- Team productivity (parallel development)

---

**Document Version:** 1.0  
**Last Updated:** October 8, 2025  
**Author:** Air Charters Development Team  
**Status:** Ready for Implementation

