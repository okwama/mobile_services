import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';
import { REDIS_CONFIG } from '@app/common';

function registerProcessHandlers() {
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
}

async function bootstrap() {
  registerProcessHandlers();
  // Create HYBRID app: HTTP server + Microservice
  // This allows API Gateway to both serve HTTP/WebSocket AND listen to Redis events
  const app = await NestFactory.create(ApiGatewayModule);

  // Connect microservice for Redis event listening
  app.connectMicroservice<MicroserviceOptions>(REDIS_CONFIG);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Air Charters Microservices API')
    .setDescription('API Gateway for Air Charters Microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('charter-deals', 'Charter deals')
    .addTag('passengers', 'Passenger management')
    .addTag('wallet', 'Wallet operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start all microservices (Redis listener)
  try {
    await app.startAllMicroservices();
  } catch (err) {
    console.error('Failed to start microservices (Redis listener):', err);
    // don't crash the entire process; the retry options in REDIS_CONFIG will attempt reconnects
  }

  const port = process.env.API_GATEWAY_PORT || 5008;
  // Listen on all interfaces (0.0.0.0) to allow connections from network devices
  await app.listen(port, '0.0.0.0');

  console.log('\n🚀 ====================================');
  console.log('   Air Charters API Gateway (Hybrid)');
  console.log('   ====================================');
  console.log(`   📡 HTTP: http://0.0.0.0:${port}`);
  console.log(`   📡 Network: http://192.168.100.14:${port}`);
  console.log(`   🔴 Redis Events: LISTENING`);
  console.log(`   📚 Docs:   http://localhost:${port}/api/docs`);
  console.log(`   🔐 Auth:   http://localhost:${port}/api/auth`);
  console.log(`   🔔 WebSocket: ws://192.168.100.14:${port}/notifications`);
  console.log('   ====================================\n');
}

bootstrap();

