import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller()
export class BaseHealthController {
  constructor(
    @InjectConnection() private connection: Connection,
  ) {}

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await this.connection.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    const responseTime = Date.now() - startTime;

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      database: dbStatus,
      responseTime: `${responseTime}ms`,
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

