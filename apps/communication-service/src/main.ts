import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { CommunicationServiceModule } from './communication-service.module';
import { REDIS_CONFIG } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunicationServiceModule,
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
  
  console.log('📨 Communication Service is listening on Redis');
  console.log(`📡 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`📧 Email: Mailtrap + Infobip`);
  console.log(`📱 SMS: Infobip`);
}

bootstrap();
