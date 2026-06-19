# Air Charters Microservices

🚀 **Modern microservices architecture** for the Air Charters platform built with NestJS.

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## 🎯 Overview

This is the microservices implementation of Air Charters backend, replacing the monolithic architecture in `air_backend/`. The system is designed for:

- **Scalability** - Scale individual services independently
- **Resilience** - Fault isolation between services
- **Flexibility** - Deploy and update services independently
- **Performance** - Optimized resource allocation

### Migration Status

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 0: Infrastructure Setup | 🟢 In Progress | 80% |
| Phase 1: User Service | ⚪ Pending | 0% |
| Phase 2: Charter & Location | ⚪ Pending | 0% |
| Phase 3: Communication | ⚪ Pending | 0% |
| Phase 4: Booking | ⚪ Pending | 0% |
| Phase 5: Payment | ⚪ Pending | 0% |
| Phase 6: Database Split | ⚪ Pending | 0% |
| Phase 7: Optimization | ⚪ Pending | 0% |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         API Gateway (Port 5008)                 │
│         - HTTP → Microservices Router           │
│         - Authentication                        │
│         - Rate Limiting                         │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │   Redis Message Broker   │
    │   - Request/Response     │
    │   - Event Bus            │
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────────────────┐
    │                                     │
┌───▼────┐  ┌────────┐  ┌────────┐  ┌───▼────┐
│ User   │  │Booking │  │Payment │  │Charter │
│:3001   │  │:3002   │  │:3003   │  │:3004   │
└────────┘  └────────┘  └────────┘  └────────┘
    
┌──────┐  ┌──────────┐
│Comms │  │Location  │
│:3005 │  │:3006     │
└──────┘  └──────────┘
```

---

## 🎪 Services

### 1. API Gateway `:5008`
- HTTP entry point for all client requests
- Routes requests to appropriate microservices
- Handles authentication & authorization
- Rate limiting & CORS

### 2. User Service `:3001`
**Domains:** Auth, Users, Passengers, Wallet

**Responsibilities:**
- User authentication (login, register, JWT)
- User profile management
- Passenger management
- Wallet operations

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/users/profile
GET    /api/passengers
GET    /api/wallet/balance
```

### 3. Charter Service `:3004`
**Domains:** Charter Deals, Aircraft, Amenities, Experiences

**Responsibilities:**
- Charter deal catalog
- Aircraft availability management
- Amenities management
- Experience templates

**Message Patterns:**
```typescript
get_charter_deals
get_charter_deal
filter_charter_deals
check_availability
reserve_aircraft
```

### 4. Booking Service `:3002`
**Domains:** Bookings, Inquiries, Direct Charter, Trips

**Responsibilities:**
- Booking creation & management
- Booking inquiries
- Direct charter bookings
- Trip scheduling

### 5. Payment Service `:3003`
**Domains:** Payments, Commission, Ledger

**Responsibilities:**
- Payment processing (Stripe, Paystack, MPesa)
- Commission calculation
- Transaction ledger
- Payment reconciliation

### 6. Communication Service `:3005`
**Domains:** Email, SMS, Notifications

**Responsibilities:**
- Email delivery (Resend)
- SMS delivery (Twilio)
- Event-driven notifications

### 7. Location Service `:3006`
**Domains:** Locations, Mapping

**Responsibilities:**
- Location search
- Route information
- Google Earth Engine integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- Redis 7+
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Running Locally

**Option 1: Run individual services**
```bash
# Terminal 1 - Start Redis
redis-server

# Terminal 2 - Start Charter Service
npm run start:charter-service

# Terminal 3 - Start API Gateway
npm run start:api-gateway
```

**Option 2: Docker Compose** (All services)
```bash
docker-compose up
```

---

## 💻 Development

### Project Structure
```
air_services/
├── apps/                           # All microservices
│   ├── api-gateway/               # HTTP gateway
│   ├── user-service/              # User & auth
│   ├── charter-service/           # Charters & aircraft
│   ├── booking-service/           # Bookings
│   ├── payment-service/           # Payments
│   ├── communication-service/     # Email/SMS
│   └── location-service/          # Locations
├── libs/                          # Shared libraries
│   ├── common/                    # DTOs, interfaces, decorators
│   │   ├── src/dto/              # Shared DTOs
│   │   ├── src/interfaces/       # Message patterns
│   │   └── src/config/           # Redis, DB configs
│   └── database/                  # Shared entities
├── docker-compose.yml             # Local development
├── nest-cli.json                  # Monorepo config
└── package.json                   # Dependencies
```

### Creating a New Service

```bash
# Generate new microservice
nest generate app new-service

# Start the new service
npm run start:new-service
```

### Message Patterns

**Request-Response (Synchronous)**
```typescript
// Caller (API Gateway)
const user = await this.userClient.send(
  { cmd: 'get_user' },
  { userId: 123 }
).toPromise();

// Handler (User Service)
@MessagePattern({ cmd: 'get_user' })
async getUser(@Payload() data: { userId: number }) {
  return this.usersService.findById(data.userId);
}
```

**Event-Based (Asynchronous)**
```typescript
// Emitter (Booking Service)
this.client.emit('booking.confirmed', booking);

// Listener (Communication Service)
@EventPattern('booking.confirmed')
async handleBookingConfirmed(booking: Booking) {
  await this.emailService.sendConfirmation(booking);
}
```

### Available Scripts

```bash
# Development
npm run start:dev                    # Start default service
npm run start:charter-service        # Start charter service
npm run start:user-service           # Start user service

# Building
npm run build                        # Build all services
npm run build:all                    # Build all explicitly

# Testing
npm run test                         # Run tests
npm run test:watch                   # Watch mode
npm run test:cov                     # Coverage
```

---

## 🚢 Deployment

### Production Build
```bash
# Build all services
npm run build:all

# Run in production mode
npm run start:prod
```

### Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `REDIS_HOST` - Redis server host
- `DB_HOST` - MySQL host
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe API key
- `PAYSTACK_SECRET_KEY` - Paystack API key

---

## 📚 Documentation

- [Migration Plan](../air_backend/MICROSERVICES_MIGRATION_PLAN.md) - Full migration strategy
- [API Reference](../air_backend/API_REFERENCE.md) - API documentation
- [Payment Flow](../air_backend/PAYMENT_FLOW_DOCUMENTATION.md) - Payment processing

---

## 🛠️ Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5
- **Database:** MySQL 8 (TypeORM)
- **Message Broker:** Redis 7
- **Validation:** class-validator, class-transformer
- **Authentication:** Passport JWT
- **Payments:** Stripe, Paystack, MPesa
- **Communication:** Twilio (SMS), Resend (Email)

---

## 📊 Monitoring

- Health checks: `GET /health` on each service
- Redis monitoring: RedisInsight
- Database monitoring: MySQL Workbench
- Logs: Console output (JSON in production)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

---

## 📝 License

MIT License - Air Charters Team

---

## 🆘 Support

For issues and questions:
- Check the [Migration Plan](../air_backend/MICROSERVICES_MIGRATION_PLAN.md)
- Review existing documentation
- Contact the development team

---

**Last Updated:** October 8, 2025  
**Version:** 1.0.0  
**Status:** Phase 0 - Infrastructure Setup

