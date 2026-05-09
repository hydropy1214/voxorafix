import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { FreeswitchEslService } from './services/sip/freeswitch-esl.service';
import { WebsocketGateway } from './gateways/websocket.gateway';
import * as os from 'os';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly esl: FreeswitchEslService,
    private readonly ws: WebsocketGateway,
  ) {}

  @Get('health')
  async health() {
    let dbStatus = 'ok';
    let dbLatency = 0;

    try {
      const t = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t;
    } catch {
      dbStatus = 'error';
    }

    const mem = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      platform: 'Voxora SIP Broadcasting',
      uptime: Math.floor(uptime),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        freeswitch: { status: this.esl.isConnected() ? 'connected' : 'disconnected' },
        websocket: { status: 'ok', connections: this.ws.getConnectedCount() },
      },
      system: {
        memory: {
          heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(mem.external / 1024 / 1024)}MB`,
        },
        cpu: os.loadavg(),
        platform: os.platform(),
      },
    };
  }

  @Get()
  root() {
    return {
      name: 'Voxora API',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/health',
    };
  }
}
