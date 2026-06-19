import { NestFactory } from '@nestjs/core';
if (!(globalThis as any).crypto) {
  try { (globalThis as any).crypto = require('crypto'); } catch (e) {}
}
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { BookingServiceModule } from './booking-service.module';
import { REDIS_CONFIG } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingServiceModule,
    REDIS_CONFIG,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
  
  console.log('📚 ====================================');
  console.log('    Booking Service is listening');
  console.log(' ====================================');
  console.log(`📡 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}`);
  console.log(`📦 Handles: Bookings, Trips, Timeline`);
  console.log('====================================');
}

bootstrap();

