import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { CharterServiceModule } from './charter-service.module';
import { REDIS_CONFIG } from '@app/common';

async function bootstrap() {
  // Create microservice with Redis transport
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CharterServiceModule,
    REDIS_CONFIG,
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen();
  
  console.log('🚁 Charter Service is listening on Redis');
  console.log(`📡 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
}

bootstrap();

