import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { YachtServiceModule } from './yacht-service.module';
import { REDIS_CONFIG } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YachtServiceModule,
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
  
  console.log('⛵ ====================================');
  console.log('    Yacht Service is listening');
  console.log(' ====================================');
  console.log(`📡 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}`);
  console.log(`🚤 Handles: Yachts, Dhows, Boats, Rafts`);
  console.log('====================================');
}

bootstrap();

