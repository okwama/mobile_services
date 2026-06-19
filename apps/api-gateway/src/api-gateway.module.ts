import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { REDIS_CONFIG } from '@app/common';
import { JwtStrategy } from './strategies/jwt.strategy';

// Import controllers
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { CharterDealsController } from './controllers/charter-deals.controller';
import { PassengersController } from './controllers/passengers.controller';
import { WalletController } from './controllers/wallet.controller';
import { LocationsController } from './controllers/locations.controller';
import { GoogleEarthEngineController } from './controllers/google-earth-engine.controller';
import { CommunicationController } from './controllers/communication.controller';
import { BookingsController } from './controllers/bookings.controller';
import { YachtsController } from './controllers/yachts.controller';
import { ExperiencesController } from './controllers/experiences.controller';
import { PaymentsController } from './controllers/payments.controller';
import { DirectCharterController } from './controllers/direct-charter.controller';
import { HealthController } from './controllers/health.controller';
import { TripsController } from './controllers/trips.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { DevicesController } from './controllers/devices.controller';

// Import gateways
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'CHARTER_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'DIRECT_CHARTER_SERVICE',
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
        name: 'COMMUNICATION_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'LOCATION_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'BOOKING_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'YACHT_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'EXPERIENCE_SERVICE',
        ...REDIS_CONFIG,
      },
      {
        name: 'PAYMENT_SERVICE',
        ...REDIS_CONFIG,
      },
    ]),
  ],
  controllers: [
    HealthController,
    AuthController,
    UsersController,
    CharterDealsController,
    PassengersController,
    TripsController,
    WalletController,
    LocationsController,
    GoogleEarthEngineController,
    CommunicationController,
    BookingsController,
    YachtsController,
    ExperiencesController,
    PaymentsController,
    DirectCharterController,
    NotificationsController,
    DevicesController,
  ],
  providers: [
    JwtStrategy,
    NotificationsGateway, // WebSocket Gateway for real-time notifications
  ],
})
export class ApiGatewayModule {}

