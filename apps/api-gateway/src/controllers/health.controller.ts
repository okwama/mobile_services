import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('CHARTER_SERVICE') private charterService: ClientProxy,
    @Inject('DIRECT_CHARTER_SERVICE') private directCharterService: ClientProxy,
    @Inject('YACHT_SERVICE') private yachtService: ClientProxy,
    @Inject('EXPERIENCE_SERVICE') private experienceService: ClientProxy,
    @Inject('LOCATION_SERVICE') private locationService: ClientProxy,
    @Inject('COMMUNICATION_SERVICE') private commsService: ClientProxy,
    @Inject('BOOKING_SERVICE') private bookingService: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'API Gateway health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
      version: '1.0.0',
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Check all microservices health (JSON)' })
  async checkAll() {
    const startTime = Date.now();

    const services = [
      { name: 'user-service', client: this.userService, port: 3001 },
      { name: 'charter-service', client: this.charterService, port: 3004 },
      { name: 'direct-charter-service', client: this.directCharterService, port: 3009 },
      { name: 'yacht-service', client: this.yachtService, port: 3007 },
      { name: 'experience-service', client: this.experienceService, port: 3008 },
      { name: 'location-service', client: this.locationService, port: 3006 },
      { name: 'communication-service', client: this.commsService, port: 3005 },
      { name: 'booking-service', client: this.bookingService, port: 3002 },
      { name: 'payment-service', client: this.paymentService, port: 3003 },
    ];

    const results = await Promise.all(
      services.map(async (svc) => {
        const checkStart = Date.now();
        try {
          const health = await firstValueFrom(
            svc.client.send({ cmd: 'health_check' }, {}).pipe(
              timeout(3000),
              catchError(() => of({ status: 'timeout' }))
            )
          );
          return {
            service: svc.name,
            port: svc.port,
            ...health,
            responseTime: `${Date.now() - checkStart}ms`,
          };
        } catch (error) {
          return {
            service: svc.name,
            port: svc.port,
            status: 'error',
            error: error.message,
            responseTime: `${Date.now() - checkStart}ms`,
          };
        }
      })
    );

    // Add API Gateway itself
    results.unshift({
      service: 'api-gateway',
      port: 5008,
      status: 'healthy',
      responseTime: '0ms',
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });

    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const totalTime = Date.now() - startTime;
    const totalServices = services.length + 1; // +1 for api-gateway

    return {
      overall: healthyCount === totalServices ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalServices: totalServices,
      healthyServices: healthyCount,
      unhealthyServices: totalServices - healthyCount,
      checkDuration: `${totalTime}ms`,
      services: results,
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'HTML Dashboard for service monitoring' })
  async dashboard(@Res() res: Response) {
    const health = await this.checkAll();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Air Charters Microservices Dashboard</title>
  <meta http-equiv="refresh" content="5">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
      margin: 0;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .header h1 { margin: 0; font-size: 32px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #1e293b;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .stat-card h3 { margin: 0 0 10px 0; font-size: 14px; opacity: 0.7; text-transform: uppercase; }
    .stat-card .value { font-size: 36px; font-weight: bold; }
    .stat-card.healthy { border-left-color: #10b981; }
    .stat-card.degraded { border-left-color: #f59e0b; }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    .service-card {
      background: #1e293b;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #334155;
    }
    .service-card.healthy { border-color: #10b981; }
    .service-card.unhealthy { border-color: #ef4444; }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .service-name {
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.healthy { background: #10b981; color: white; }
    .status-badge.unhealthy { background: #ef4444; color: white; }
    .status-badge.timeout { background: #f59e0b; color: white; }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #334155;
    }
    .metric:last-child { border-bottom: none; }
    .metric-label { opacity: 0.7; }
    .metric-value { font-weight: 600; }
    .port { font-family: 'Monaco', monospace; color: #3b82f6; }
    .timestamp { text-align: center; margin-top: 20px; opacity: 0.5; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Air Charters Microservices</h1>
      <p>Real-time Service Monitoring Dashboard • Auto-refreshes every 5 seconds</p>
    </div>

    <div class="stats">
      <div class="stat-card ${health.overall}">
        <h3>Overall Status</h3>
        <div class="value">${health.overall === 'healthy' ? '✅ Healthy' : '⚠️ Degraded'}</div>
      </div>
      <div class="stat-card">
        <h3>Services Running</h3>
        <div class="value">${health.healthyServices}/${health.totalServices}</div>
      </div>
      <div class="stat-card">
        <h3>Check Duration</h3>
        <div class="value">${health.checkDuration}</div>
      </div>
      <div class="stat-card">
        <h3>Last Updated</h3>
        <div class="value" style="font-size: 16px;">${new Date().toLocaleTimeString()}</div>
      </div>
    </div>

    <div class="services-grid">
      ${health.services.map(svc => `
        <div class="service-card ${svc.status === 'healthy' ? 'healthy' : 'unhealthy'}">
          <div class="service-header">
            <div class="service-name">
              ${this.getServiceIcon(svc.service)} ${svc.service}
            </div>
            <span class="status-badge ${svc.status}">${svc.status}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Port</span>
            <span class="metric-value port">:${svc.port}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Response Time</span>
            <span class="metric-value">${svc.responseTime}</span>
          </div>
          ${svc.database ? `
          <div class="metric">
            <span class="metric-label">Database</span>
            <span class="metric-value">${svc.database === 'connected' ? '✅ Connected' : '❌ Disconnected'}</span>
          </div>` : ''}
          ${svc.uptime ? `
          <div class="metric">
            <span class="metric-label">Uptime</span>
            <span class="metric-value">${svc.uptime}</span>
          </div>` : ''}
          ${svc.memory ? `
          <div class="metric">
            <span class="metric-label">Memory</span>
            <span class="metric-value">${svc.memory.used} / ${svc.memory.total}</span>
          </div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="timestamp">
      Last checked: ${health.timestamp} • Check duration: ${health.checkDuration}
    </div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  private getServiceIcon(serviceName: string): string {
    const icons = {
      'api-gateway': '🚪',
      'user-service': '👤',
      'charter-service': '✈️',
      'direct-charter-service': '🚁',
      'yacht-service': '⛵',
      'experience-service': '🎪',
      'location-service': '📍',
      'communication-service': '📨',
      'booking-service': '📚',
      'payment-service': '💳',
    };
    return icons[serviceName] || '🔧';
  }
}
