import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'air_charters',
  entities: [],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    charset: 'utf8mb4_unicode_ci',
    multipleStatements: false,
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    lockWaitTimeout: 30000,
    innodbLockWaitTimeout: 30,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  maxQueryExecutionTime: 30000,
  cache: {
    duration: 30000,
  },
});

