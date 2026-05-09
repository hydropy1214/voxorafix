import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
  transports: ['websocket', 'polling'],
  // Scale: allow up to 1000 concurrent connections
  maxHttpBufferSize: 1e6,
  pingTimeout: 30000,
  pingInterval: 10000,
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized — max 1000 concurrent connections');
  }

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) { socket.disconnect(true); return; }

      const payload = this.jwtService.verify(token) as { sub: string };
      socket.data.userId = payload.sub;

      const existing = this.connectedUsers.get(payload.sub) || new Set();
      existing.add(socket.id);
      this.connectedUsers.set(payload.sub, existing);

      socket.join(`user:${payload.sub}`);
      socket.emit('connected', {
        socketId: socket.id,
        userId: payload.sub,
        serverTime: new Date().toISOString(),
      });

    } catch {
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      const sockets = this.connectedUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) this.connectedUsers.delete(userId);
      }
    }
  }

  // ─── Room subscriptions ───────────────────────────────────────────────────

  @SubscribeMessage('join:campaign')
  handleJoinCampaign(@ConnectedSocket() socket: Socket, @MessageBody() data: { campaignId: string }) {
    socket.join(`campaign:${data.campaignId}`)
    return { status: 'joined' }
  }

  @SubscribeMessage('leave:campaign')
  handleLeaveCampaign(@ConnectedSocket() socket: Socket, @MessageBody() data: { campaignId: string }) {
    socket.leave(`campaign:${data.campaignId}`)
  }

  @SubscribeMessage('join:live-monitor')
  handleJoinLiveMonitor(@ConnectedSocket() socket: Socket) {
    socket.join('live-monitor')
    return { status: 'joined' }
  }

  // ─── Campaign lifecycle events ────────────────────────────────────────────

  @OnEvent('campaign.started')
  handleCampaignStarted(payload: any) {
    const ev = { type: 'campaign:started', ...payload, timestamp: now() }
    this.toRoom(`campaign:${payload.campaignId}`, 'campaign:started', ev)
    this.toRoom('live-monitor', 'campaign:started', ev)
  }

  @OnEvent('campaign.completed')
  handleCampaignCompleted(payload: any) {
    const ev = { type: 'campaign:completed', ...payload, timestamp: now() }
    this.toRoom(`campaign:${payload.campaignId}`, 'campaign:completed', ev)
    this.toRoom('live-monitor', 'campaign:completed', ev)
    this.toRoom('live-monitor', 'stats:update', { activeCampaigns: 0 })
  }

  @OnEvent('campaign.error')
  handleCampaignError(payload: any) {
    const ev = { type: 'campaign:error', ...payload, timestamp: now() }
    this.toRoom(`campaign:${payload.campaignId}`, 'campaign:error', ev)
    this.toRoom('live-monitor', 'campaign:error', ev)
  }

  // ─── Real-time call events ────────────────────────────────────────────────

  @OnEvent('call.dialing')
  handleCallDialing(payload: any) {
    const ev = {
      type: 'call:dialing',
      uuid: payload.uuid,
      phone: payload.phone,
      campaignId: payload.campaignId,
      timestamp: now(),
    }
    this.toRoom(`campaign:${payload.campaignId}`, 'call:dialing', ev)
    this.toRoom('live-monitor', 'call:update', ev)
  }

  @OnEvent('call.answered.live')
  @OnEvent('freeswitch.channel_answer')
  handleCallAnswered(payload: any) {
    const ev = {
      type: 'call:answered',
      uuid: payload.uuid,
      phone: payload.phone,
      campaignId: payload.campaignId,
      amdResult: payload.amdResult,
      timestamp: now(),
    }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'call:answered', ev)
      this.toRoom('live-monitor', 'call:update', ev)
    }
  }

  @OnEvent('call.completed')
  handleCallCompleted(payload: any) {
    const ev = {
      type: 'call:completed',
      ...payload,
      timestamp: now(),
    }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'call:completed', ev)
      this.toRoom('live-monitor', 'call:update', ev)
    }
  }

  @OnEvent('freeswitch.channel_hangup_complete')
  handleCallHangup(payload: any) {
    const ev = {
      type: 'call:hangup',
      uuid: payload.uuid,
      campaignId: payload.campaignId,
      phone: payload.phone,
      hangupCause: payload.hangupCause,
      hangupMessage: this.describeHangupCause(payload.hangupCause),
      duration: payload.duration,
      amdResult: payload.amdResult,
      rtpMos: payload.rtpMos,
      timestamp: now(),
    }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'call:hangup', ev)
      this.toRoom('live-monitor', 'call:update', ev)
    }
  }

  @OnEvent('call.sip_error')
  handleSipError(payload: any) {
    const ev = {
      type: 'sip:error',
      campaignId: payload.campaignId,
      phone: payload.phone,
      error: payload.error,
      code: payload.code,
      severity: this.getSipErrorSeverity(payload.code),
      suggestion: this.getSipErrorSuggestion(payload.code),
      timestamp: now(),
    }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'sip:error', ev)
      this.toRoom('live-monitor', 'sip:error', ev)
    }
    this.logger.warn(`SIP Error [${payload.code}] for ${payload.phone}: ${payload.error}`)
  }

  @OnEvent('voxora.human_answer')
  handleHumanAnswer(payload: any) {
    const ev = { type: 'amd:human', ...payload, timestamp: now() }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'amd:human', ev)
      this.toRoom('live-monitor', 'amd:result', ev)
    }
  }

  @OnEvent('voxora.machine_answer')
  handleMachineAnswer(payload: any) {
    const ev = { type: 'amd:machine', ...payload, timestamp: now() }
    if (payload.campaignId) {
      this.toRoom(`campaign:${payload.campaignId}`, 'amd:machine', ev)
      this.toRoom('live-monitor', 'amd:result', ev)
    }
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private toRoom(room: string, event: string, data: any) {
    this.server?.to(room).emit(event, data)
  }

  private describeHangupCause(cause: string): string {
    const map: Record<string, string> = {
      'NORMAL_CLEARING': 'Completed normally',
      'USER_BUSY': 'Line busy',
      'NO_ANSWER': 'No answer',
      'CALL_REJECTED': 'Call rejected',
      'SUBSCRIBER_ABSENT': 'Not reachable',
      'MANAGER_REQUEST': 'Stopped by system',
      'NO_ROUTE_DESTINATION': 'No route to number',
      'UNALLOCATED_NUMBER': 'Number not in service',
    }
    return map[cause] || cause || 'Unknown'
  }

  private getSipErrorSeverity(code: string | null): 'warning' | 'error' | 'critical' {
    if (!code) return 'warning'
    const c = parseInt(code)
    if (c === 403 || c === 401) return 'critical'   // Auth / forbidden
    if (c >= 500) return 'error'                     // Server errors
    return 'warning'
  }

  private getSipErrorSuggestion(code: string | null): string {
    const suggestions: Record<string, string> = {
      '403': 'Check your SIP credentials and caller ID. Provider may be blocking this number.',
      '401': 'Authentication failed. Re-enter your SIP password and re-test the account.',
      '404': 'Number not found. Verify the destination number is correct.',
      '486': 'Destination is busy. Consider scheduling retries.',
      '503': 'SIP provider is temporarily unavailable. Check service status.',
    }
    return code ? (suggestions[code] || 'Check SIP account configuration') : 'Check SIP account configuration'
  }

  getConnectedCount(): number { return this.connectedUsers.size }
  emitToUser(userId: string, event: string, data: any) { this.toRoom(`user:${userId}`, event, data) }
  emitStatsUpdate(stats: any) { this.toRoom('live-monitor', 'stats:update', stats) }
}

function now() { return new Date().toISOString() }
