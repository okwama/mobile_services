import { NestFactory } from '@nestjs/core';
// Ensure Node's crypto is available when code is bundled (webpack) or run in environments
if (!(globalThis as any).crypto) {
  try { (globalThis as any).crypto = require('crypto'); } catch (e) {}
}
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';
import { REDIS_CONFIG } from '@app/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';
import * as os from 'os';

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

  // Global exception filter (must be before validation pipe)
  app.useGlobalFilters(new AllExceptionsFilter());

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

  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Request logging: console + file
  const networkLogStream = fs.createWriteStream(path.join(logsDir, 'network.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: networkLogStream }));
  app.use(morgan('dev'));

  // Start all microservices (Redis listener)
  try {
    await app.startAllMicroservices();
  } catch (err) {
    console.error('Failed to start microservices (Redis listener):', err);
    // don't crash the entire process; the retry options in REDIS_CONFIG will attempt reconnects
  }

  const port = process.env.API_GATEWAY_PORT || 5007;
  // Listen on all interfaces (0.0.0.0) to allow connections from network devices
  await app.listen(port, '0.0.0.0');

  console.log('\n🚀 ====================================');
  console.log('   Air Charters API Gateway (Hybrid)');
  console.log('   ====================================');
  console.log(`   📡 HTTP (bound): http://0.0.0.0:${port}`);

  // Best practice: prefer a configured public host, otherwise list non-loopback IPv4 addresses
  const publicHost = process.env.PUBLIC_HOST;
  let networkAddresses: string[] = [];
  if (publicHost) {
    networkAddresses = [publicHost];
  } else {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      const addrs = ifaces[name] || [];
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          networkAddresses.push(addr.address);
        }
      }
    }
  }

  const networkMsg = networkAddresses.length
    ? networkAddresses.map(a => `http://${a}:${port}`).join(', ')
    : `http://localhost:${port}`;

  console.log(`   📡 Network: ${networkMsg}`);
  console.log(`   🔴 Redis Events: LISTENING`);
  console.log(`   📚 Docs:   http://localhost:${port}/api/docs`);
  console.log(`   🔐 Auth:   http://localhost:${port}/api/auth`);
  // WebSocket URL examples (replace with PUBLIC_HOST if using DNS)
  const wsHost = publicHost || (networkAddresses[0] ?? 'localhost');
  console.log(`   🔔 WebSocket: ws://${wsHost}:${port}/notifications`);
  console.log('   ====================================\n');
}

bootstrap();

