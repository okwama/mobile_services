import { Transport, RedisOptions } from '@nestjs/microservices';

export const REDIS_CONFIG: RedisOptions = {
  transport: Transport.REDIS,
  options: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    retryAttempts: 5,
    retryDelay: 1000,
  },
};

export const getRedisConfig = (): RedisOptions => REDIS_CONFIG;

