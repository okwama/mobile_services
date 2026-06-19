import { Controller, Get, Inject, Res, Param, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
const Database = require('better-sqlite3');

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
  ) {
    try {
      const dbPath = path.resolve(process.cwd(), 'health_history.sqlite');
      try { fs.mkdirSync(path.dirname(dbPath), { recursive: true }); } catch {}
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.prepare('CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, service TEXT, ts INTEGER, status TEXT)').run();
    } catch (e) {
      // If DB fails, continue without history
      this.db = null;
      const emsg = (e as any)?.message || String(e);
      console.warn('SQLite init failed:', emsg);
    }
  }

  private db: any = null;

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
          this.recordHistory(svc.name, statusVal);
          return {
            service: svc.name,
            port: svc.port,
            ...health,
            responseTime: `${Date.now() - checkStart}ms`,
            history: this.getHistory(svc.name, 40),
          };
        } catch (error) {
              const msg = (error as any)?.message || String(error);
              this.recordHistory(svc.name, 'error');
              return {
                service: svc.name,
                port: svc.port,
                status: 'error',
                error: msg,
                responseTime: `${Date.now() - checkStart}ms`,
                history: this.getHistory(svc.name, 40),
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
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 14px;
    }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 6px 0 0 0; opacity: 0.9; font-size:12px }
    .stats {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap:wrap;
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
    .services-list { display:block; }
    .service-row { display:flex; align-items:center; justify-content:space-between; gap:12px; background:#0b1220; padding:10px 12px; border-radius:8px; border:1px solid #172033; margin-bottom:8px }
    .service-left { display:flex; align-items:center; gap:12px }
    .service-name { font-size:14px; font-weight:600; display:flex; align-items:center; gap:10px }
    .material-icons.md-18 { font-size:18px; vertical-align:middle }
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
    .metric { display:flex; gap:12px; align-items:center }
    .metric:last-child { border-bottom: none; }
    .metric-label { opacity: 0.7; }
    .metric-value { font-weight: 600; }
    .port { font-family: 'Monaco', monospace; color: #93c5fd; font-size:12px }
    .uptime-bar { display:flex; gap:2px; align-items:center }
    .uptime-bar span { width:6px; height:18px; display:inline-block; border-radius:2px }
    .small-meta { font-size:12px; color:#9ca3af }
    .timestamp { text-align: center; margin-top: 20px; opacity: 0.5; font-size: 12px; }
    .service-link { color: #93c5fd; text-decoration: none; font-size:13px }
    .view-json { background: transparent; border:1px solid #243b5a; padding:6px 10px; border-radius:6px; color:#93c5fd; text-decoration:none; font-weight:600; font-size:12px }
    .copy-btn { background:#243b5a;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer; font-weight:600; font-size:12px }
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
      <div class="services-list">
      ${health.services.map(svc => `
        <div class="service-row">
          <div class="service-left">
            ${this.getServiceIcon(svc.service)}
            <div>
              <div class="service-name"><a class="service-link" href="/health/service/${svc.service}" target="_blank">${svc.service}</a></div>
              <div class="small-meta">Port <span class="port">:${svc.port}</span> • ${svc.responseTime}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="uptime-bar">
              ${(() => {
                const hist = svc.history || [];
                const padded = Array.from({length:40 - hist.length}).map(()=> 'unknown').concat(hist.slice(-40));
                return padded.map(h => `<span style="background:${h==='healthy'?'#10b981': h==='timeout'?'#f59e0b': h==='error'?'#ef4444':'#334155'}"></span>`).join('');
              })()}
            </div>
            <div style="text-align:right">
              <div class="status-badge ${svc.status}" style="font-size:12px;padding:6px 8px">${svc.status}</div>
              <div class="small-meta">${svc.uptime?svc.uptime:''}</div>
            </div>
          </div>
        </div>
      `).join('')}
      </div>
    </div>

    <div class="timestamp">
      Last checked: ${health.timestamp} • Check duration: ${health.checkDuration}
    </div>
  </div>
  <script>
    document.addEventListener('click', function(e){
      if(e.target && e.target.matches('.copy-btn')){
        const url = window.location.origin + e.target.getAttribute('data-url');
        navigator.clipboard.writeText(url).then(()=> {
          const old = e.target.textContent;
          e.target.textContent = 'Copied!';
          setTimeout(()=> e.target.textContent = old, 1500);
        }).catch(()=> alert('Copy failed'));
      }
    });
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
    return `<span class="material-icons md-18">${icon}</span>`;
  }
  
  private recordHistory(service: string, status: string) {
    try {
      if (!this.db) return;
      const stmt = this.db.prepare('INSERT INTO history (service, ts, status) VALUES (?, ?, ?)');
      stmt.run(service, Date.now(), status);
      // optional: keep table small by deleting old rows (keep last 1000 per service)
      this.db.prepare('DELETE FROM history WHERE id IN (SELECT id FROM history WHERE service = ? ORDER BY ts DESC LIMIT -1 OFFSET 1000)').run(service);
    } catch (e) {
      // ignore
    }
  }

  private getHistory(service: string, limit = 40) {
    try {
      if (!this.db) return [];
      const rows = this.db.prepare('SELECT status FROM history WHERE service = ? ORDER BY ts DESC LIMIT ?').all(service, limit);
      return rows.map((r: any) => r.status).reverse();
    } catch (e) {
      return [];
    }
  }
}
