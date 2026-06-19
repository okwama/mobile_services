import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller()
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    const startTime = Date.now();
    
    let dbStatus = 'disconnected';
    try {
      await this.connection.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      service: 'booking-service',
      database: dbStatus,
      responseTime: `${Date.now() - startTime}ms`,
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }
}

