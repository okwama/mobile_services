import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DirectCharterServiceModule } from './direct-charter-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DirectCharterServiceModule,
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        retryAttempts: 5,
        retryDelay: 3000,
      },
    },
  );

  await app.listen();
  console.log('🚁 Direct Charter Service is listening on Redis');
  console.log(`📡 Redis: ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
}

bootstrap();
