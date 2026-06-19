import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { PaymentServiceModule } from './payment-service.module';
import { REDIS_CONFIG } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
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
  
  console.log('💳 ====================================');
  console.log('    Payment Service is listening');
  console.log(' ====================================');
  console.log(`📡 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}`);
  console.log(`💰 Provider: Paystack`);
  console.log(`📊 Commission: Dynamic from DB`);
  console.log('====================================');
}

bootstrap();

