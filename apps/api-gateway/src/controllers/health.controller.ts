import { Controller, Get, Inject, Res, Param, NotFoundException } from '@nestjs/common';
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
    // Helper to get port from env with fallback
    const getPort = (envVar: string, fallback: number) => {
      const val = process.env[envVar];
      if (!val) return fallback;
      const n = parseInt(val, 10);
      return Number.isNaN(n) ? fallback : n;
    };

    const services = [
      { name: 'user-service', client: this.userService, port: getPort('USER_SERVICE_PORT', 4001) },
      { name: 'charter-service', client: this.charterService, port: getPort('CHARTER_SERVICE_PORT', 4004) },
      { name: 'direct-charter-service', client: this.directCharterService, port: getPort('DIRECT_CHARTER_SERVICE_PORT', 3009) },
      { name: 'yacht-service', client: this.yachtService, port: getPort('YACHT_SERVICE_PORT', 4007) },
      { name: 'experience-service', client: this.experienceService, port: getPort('EXPERIENCE_SERVICE_PORT', 4008) },
      { name: 'location-service', client: this.locationService, port: getPort('LOCATION_SERVICE_PORT', 4006) },
      { name: 'communication-service', client: this.commsService, port: getPort('COMMUNICATION_SERVICE_PORT', 4005) },
      { name: 'booking-service', client: this.bookingService, port: getPort('BOOKING_SERVICE_PORT', 4002) },
      { name: 'payment-service', client: this.paymentService, port: getPort('PAYMENT_SERVICE_PORT', 4003) },
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
          const statusVal = health && health.status ? health.status : 'healthy';
          return {
            service: svc.name,
            port: svc.port,
            ...health,
            responseTime: `${Date.now() - checkStart}ms`,
          };
        } catch (error) {
              const msg = (error as any)?.message || String(error);
              return {
                service: svc.name,
                port: svc.port,
                status: 'error',
                error: msg,
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
  <title>Air Charters - Service Monitor</title>
  <meta http-equiv="refresh" content="5">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      padding: 24px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 16px;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-left h1 { font-size: 28px; font-weight: 700; }
    .material-icons { font-size: 32px; color: #2196F3; }
    .header-right { display: flex; gap: 16px; align-items: center; }
    .timestamp-text { font-size: 13px; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196F3;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-card.healthy { border-left-color: #4caf50; }
    .stat-card.degraded { border-left-color: #ff9800; }
    .stat-icon { font-size: 36px; opacity: 0.6; }
    .stat-content h3 { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 4px; }
    .stat-content .value { font-size: 28px; font-weight: 700; }
    .services-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .service-card {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .service-header { display: flex; align-items: center; gap: 12px; }
    .service-icon { font-size: 28px; color: #2196F3; }
    .service-info { flex: 1; }
    .service-name { font-size: 16px; font-weight: 700; color: #1a1a1a; }
    .service-port { font-size: 12px; color: #999; font-family: monospace; }
    .service-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .service-status.healthy { background: #e8f5e9; color: #2e7d32; }
    .service-status.error { background: #ffebee; color: #c62828; }
    .service-status.timeout { background: #fff3e0; color: #e65100; }
    .service-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }
    .response-time { display: flex; align-items: center; gap: 4px; }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .status-dot.healthy { background: #4caf50; }
    .status-dot.error { background: #f44336; }
    .status-dot.timeout { background: #ff9800; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #999; }
    .refresh-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e3f2fd;
      color: #1976d2;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <span class="material-icons">cloud_queue</span>
        <h1>Service Monitor</h1>
      </div>
      <div class="header-right">
        <div class="refresh-badge">
          <span class="material-icons" style="font-size: 16px;">refresh</span>
          Auto-refresh: 5s
        </div>
        <div class="timestamp-text" id="time">${new Date().toLocaleTimeString()}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card ${health.overall}">
        <span class="material-icons stat-icon">${health.overall === 'healthy' ? 'check_circle' : 'warning'}</span>
        <div class="stat-content">
          <h3>Status</h3>
          <div class="value">${health.overall === 'healthy' ? 'Healthy' : 'Degraded'}</div>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon">assessment</span>
        <div class="stat-content">
          <h3>Running</h3>
          <div class="value">${health.healthyServices}/${health.totalServices}</div>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon">speed</span>
        <div class="stat-content">
          <h3>Response</h3>
          <div class="value" style="font-size: 18px;">${health.checkDuration}</div>
        </div>
      </div>
    </div>

    <div class="services-container">
      ${health.services.map(svc => `
        <div class="service-card">
          <div class="service-header">
            <span class="material-icons service-icon">${this.getServiceIcon(svc.service)}</span>
            <div class="service-info">
              <div class="service-name">${svc.service}</div>
              <div class="service-port">Port :${svc.port}</div>
            </div>
            <span class="service-status ${svc.status}">
              <span class="status-dot ${svc.status}"></span>
              ${svc.status}
            </span>
          </div>
          <div class="service-meta">
            <div class="response-time">
              <span class="material-icons" style="font-size: 14px;">schedule</span>
              ${svc.responseTime}
            </div>
            ${svc.uptime ? `<div>${svc.uptime}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      Last update: ${health.timestamp} | Check duration: ${health.checkDuration}
    </div>
  </div>
  <script>
    setInterval(() => {
      document.getElementById('time').textContent = new Date().toLocaleTimeString();
    }, 1000);
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('service/:name')
  @ApiOperation({ summary: 'Check single microservice health (JSON)' })
  async checkService(@Param('name') name: string) {
    const all = await this.checkAll();
    const svc = all.services.find((s: any) => s.service === name);
    if (!svc) {
      throw new NotFoundException(`Service not found: ${name}`);
    }
    return svc;
  }

  private getServiceIcon(serviceName: string): string {
    const icons: Record<string,string> = {
      'api-gateway': 'cloud_queue',
      'user-service': 'person',
      'charter-service': 'flight_takeoff',
      'direct-charter-service': 'near_me',
      'yacht-service': 'directions_boat',
      'experience-service': 'emoji_events',
      'location-service': 'place',
      'communication-service': 'mail',
      'booking-service': 'book_online',
      'payment-service': 'credit_card',
    };
    const icon = icons[serviceName] || 'build';
    return icon;
  }
}
