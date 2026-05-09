import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { SipService } from '../../services/sip/sip.service';

interface CampaignJob {
  campaignId: string;
  userId: string;
}

// SIP error code mappings to human-readable messages
const SIP_ERROR_MESSAGES: Record<string, string> = {
  'USER_BUSY': 'Destination busy',
  'NO_ANSWER': 'No answer',
  'NO_USER_RESPONSE': 'No response',
  'NORMAL_CLEARING': 'Call completed normally',
  'NORMAL_TEMPORARY_FAILURE': 'Temporary failure — will retry',
  'CALL_REJECTED': 'Call rejected by destination',
  'SUBSCRIBER_ABSENT': 'Subscriber not reachable',
  'UNALLOCATED_NUMBER': 'Number not in service',
  'INVALID_NUMBER_FORMAT': 'Invalid phone number format',
  'FACILITY_REJECTED': 'Facility rejected — check caller ID',
  'ORIGINATOR_CANCEL': 'Cancelled by originator',
  'MANAGER_REQUEST': 'Stopped by campaign manager',
  'MEDIA_TIMEOUT': 'RTP media timeout',
  'DESTINATION_OUT_OF_ORDER': 'Destination out of service',
  'NETWORK_OUT_OF_ORDER': 'Network unavailable',
  'RECOVERY_ON_TIMER_EXPIRE': 'Session timeout',
  'PROTOCOL_ERROR': 'SIP protocol error',
  'INTERWORKING': 'SIP interworking failure',
  '403': 'Forbidden — check caller ID or SIP credentials',
  '404': 'Number not found at provider',
  '486': 'Busy here',
  '487': 'Request terminated',
  '503': 'SIP service temporarily unavailable',
};

@Processor('campaign')
export class CampaignProcessor {
  private readonly logger = new Logger(CampaignProcessor.name);
  private readonly activeWorkers = new Map<string, boolean>();
  // Track pending call completions: uuid → resolve function
  private readonly pendingCalls = new Map<string, (result: any) => void>();

  constructor(
    private prisma: PrismaService,
    private sipService: SipService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ─── Listen for real-time FreeSWITCH events ───────────────────────────────

  @OnEvent('freeswitch.channel_hangup_complete')
  onHangupComplete(payload: any) {
    const resolver = this.pendingCalls.get(payload.uuid);
    if (resolver) {
      resolver(payload);
      this.pendingCalls.delete(payload.uuid);
    }
  }

  @OnEvent('freeswitch.channel_answer')
  onCallAnswered(payload: any) {
    // Optionally notify UI that a specific call was answered
    this.eventEmitter.emit('call.answered.live', payload);
  }

  // ─── Campaign processor ───────────────────────────────────────────────────

  @Process('start')
  async handleStart(job: Job<CampaignJob>) {
    const { campaignId } = job.data;
    this.logger.log(`[Campaign ${campaignId}] Starting`);
    this.activeWorkers.set(campaignId, true);

    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { sipAccount: true, audioFile: true, voicemailAudio: true },
      });

      if (!campaign || campaign.status !== 'RUNNING') return;

      // Validate SIP account is registered
      if (campaign.sipAccount.status === 'FAILED') {
        await this.failCampaign(campaignId, 'SIP account not registered');
        this.eventEmitter.emit('campaign.error', {
          campaignId,
          error: `SIP account ${campaign.sipAccount.name} is not registered`,
          code: 'SIP_NOT_REGISTERED',
        });
        return;
      }

      // Validate audio file
      if (!campaign.audioFile || campaign.audioFile.status !== 'READY') {
        await this.failCampaign(campaignId, 'Audio file not ready');
        return;
      }

      // Resolve caller ID — MUST work without caller ID too
      const callerId = this.resolveCallerId(campaign);

      const contacts = await this.prisma.contact.findMany({
        where: {
          listId: campaign.contactListId,
          isValid: true,
          isDuplicate: false,
          isOptedOut: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.log(`[Campaign ${campaignId}] ${contacts.length} contacts | caller: ${callerId || 'auto'} | max:${campaign.maxConcurrentCalls}`);

      this.eventEmitter.emit('campaign.started', { campaignId, totalContacts: contacts.length });

      const maxConcurrent = Math.max(1, campaign.maxConcurrentCalls);
      const delayBetweenCalls = Math.max(100, Math.floor(1000 / campaign.callsPerSecond));

      const semaphore = new Semaphore(maxConcurrent);
      const callPromises: Promise<void>[] = [];

      for (const contact of contacts) {
        if (!this.activeWorkers.get(campaignId)) {
          this.logger.log(`[Campaign ${campaignId}] Stopped by worker flag`);
          break;
        }

        const freshStatus = await this.prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true },
        });

        if (freshStatus?.status !== 'RUNNING') break;

        await semaphore.acquire();

        const callPromise = this.placeCall(campaign, contact, campaignId, callerId)
          .finally(() => semaphore.release());

        callPromises.push(callPromise);
        await this.sleep(delayBetweenCalls);
      }

      // Wait for all pending calls to complete (with global timeout)
      const CALL_TIMEOUT_MS = 180_000; // 3 minutes max per call
      await Promise.race([
        Promise.allSettled(callPromises),
        this.sleep(CALL_TIMEOUT_MS),
      ]);

      // Finalize any stuck DIALING/RINGING calls
      await this.prisma.callLog.updateMany({
        where: { campaignId, status: { in: ['DIALING', 'RINGING'] } },
        data: { status: 'NOANSWER' as any, hangupCause: 'NO_ANSWER', hangupAt: new Date() },
      });

      const finalStatus = this.activeWorkers.get(campaignId) ? 'COMPLETED' : 'CANCELLED';
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { status: finalStatus as any, completedAt: new Date(), activeCalls: 0 },
      });

      this.eventEmitter.emit('campaign.completed', { campaignId, status: finalStatus });
      this.logger.log(`[Campaign ${campaignId}] ${finalStatus}`);

    } catch (err) {
      this.logger.error(`[Campaign ${campaignId}] Fatal error: ${err.message}`);
      await this.failCampaign(campaignId, err.message);
    } finally {
      this.activeWorkers.delete(campaignId);
    }
  }

  // ─── Individual call placement ────────────────────────────────────────────

  private async placeCall(campaign: any, contact: any, campaignId: string, callerId: string | null) {
    const phone = contact.formattedPhone || contact.phone;

    const callLog = await this.prisma.callLog.create({
      data: {
        userId: campaign.userId,
        campaignId,
        contactId: contact.id,
        phone,
        direction: 'outbound',
        status: 'DIALING',
        uuid: `pending-${contact.id}-${Date.now()}`,
        startedAt: new Date(),
      },
    });

    try {
      const result = await this.sipService.originate({
        destination: phone,
        gateway: campaign.sipAccount.username + '@' + campaign.sipAccount.sipServer,
        callerIdNumber: callerId || undefined,
        callerIdName: campaign.callerIdName || campaign.sipAccount.callerIdName || 'Voxora',
        audioFile: campaign.audioFile?.storagePath,
        voicemailAudio: campaign.voicemailAudio?.storagePath,
        campaignId,
        amdEnabled: campaign.amdEnabled ?? true,
        amdAction: campaign.amdAction ?? 'PLAY_ON_HUMAN',
        timeout: 60,
      });

      const uuid = result.uuid;

      await this.prisma.callLog.update({
        where: { id: callLog.id },
        data: { uuid, status: 'RINGING' },
      });

      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { processedContacts: { increment: 1 }, activeCalls: { increment: 1 } },
      });

      // Emit live event to WebSocket clients
      this.eventEmitter.emit('call.dialing', {
        campaignId,
        uuid,
        phone,
        callLogId: callLog.id,
        userId: campaign.userId,
      });

      // Wait for CHANNEL_HANGUP_COMPLETE (or timeout after 2 minutes)
      const hangupResult = await this.waitForHangup(uuid, 120_000);

      if (hangupResult) {
        await this.processHangup(callLog.id, hangupResult);
      } else {
        // Timed out — mark as no-answer
        await this.prisma.callLog.update({
          where: { id: callLog.id },
          data: { status: 'NOANSWER', hangupCause: 'NO_ANSWER', hangupAt: new Date() },
        });
        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: { noanswer: { increment: 1 }, activeCalls: { decrement: 1 } },
        });
      }

    } catch (err) {
      const errorMsg = this.parseSipError(err.message);
      this.logger.warn(`[Campaign ${campaignId}] Call to ${phone} failed: ${errorMsg}`);

      await this.prisma.callLog.update({
        where: { id: callLog.id },
        data: { status: 'FAILED', hangupCause: errorMsg, hangupAt: new Date() },
      });

      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { processedContacts: { increment: 1 }, failedCalls: { increment: 1 } },
      });

      // Emit SIP error event to frontend in real-time
      this.eventEmitter.emit('call.sip_error', {
        campaignId,
        userId: campaign.userId,
        phone,
        error: errorMsg,
        code: this.extractSipCode(err.message),
        callLogId: callLog.id,
      });
    } finally {
      /* pendingCalls cleared in onHangupComplete */
    }
  }

  // ─── Wait for HANGUP event with timeout ───────────────────────────────────

  private waitForHangup(uuid: string, timeoutMs: number): Promise<any | null> {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.pendingCalls.delete(uuid);
        resolve(null);
      }, timeoutMs);

      this.pendingCalls.set(uuid, (result) => {
        clearTimeout(timer);
        resolve(result);
      });
    });
  }

  // ─── Process hangup result ────────────────────────────────────────────────

  private async processHangup(callLogId: string, payload: any) {
    const row = await this.prisma.callLog.findUnique({ where: { id: callLogId } });
    if (!row) return;

    const campaignId = row.campaignId;
    const cause = payload.hangupCause || 'UNKNOWN';
    const duration = Math.max(0, parseInt(payload.duration || '0', 10));
    const amdResult = payload.amdResult;

    const isAnswered = !['USER_BUSY', 'NO_ANSWER', 'NO_USER_RESPONSE',
      'NORMAL_TEMPORARY_FAILURE', 'CALL_REJECTED', 'SUBSCRIBER_ABSENT',
      'ORIGINATOR_CANCEL'].includes(cause) && duration > 0;

    const isBusy = cause === 'USER_BUSY';
    const isNoAnswer = ['NO_ANSWER', 'NO_USER_RESPONSE', 'ORIGINATOR_CANCEL'].includes(cause);

    const status = isAnswered ? 'COMPLETED' : isBusy ? 'BUSY' : isNoAnswer ? 'NOANSWER' : 'FAILED';
    const isHuman = amdResult === 'HUMAN';
    const isMachine = amdResult === 'MACHINE';

    const mosScore = parseFloat(payload.rtpMos || '0') || null;
    const jitter = parseInt(payload.rtpJitter || '0', 10) || null;

    await this.prisma.callLog.update({
      where: { id: callLogId },
      data: {
        status: status as any,
        hangupCause: cause,
        hangupAt: new Date(),
        duration,
        billableDuration: duration,
        amdResult: amdResult as any || null,
        rtpMos: mosScore,
        rtpJitter: jitter,
        answeredAt: isAnswered ? new Date(Date.now() - duration * 1000) : undefined,
      },
    });

    if (campaignId) {
      const updates: any = { activeCalls: { decrement: 1 } };
      if (isAnswered) {
        updates.answeredCalls = { increment: 1 };
        updates.totalDuration = { increment: duration };
        if (isHuman) updates.humanAnswers = { increment: 1 };
        if (isMachine) updates.machineAnswers = { increment: 1 };
      } else if (isBusy) {
        updates.busyCalls = { increment: 1 };
      } else if (isNoAnswer) {
        updates.noanswer = { increment: 1 };
      } else {
        updates.failedCalls = { increment: 1 };
      }

      await this.prisma.campaign.update({ where: { id: campaignId }, data: updates });
    }

    // Emit to WebSocket for real-time dashboard update
    this.eventEmitter.emit('call.completed', {
      campaignId,
      userId: row.userId,
      callLogId,
      status,
      cause,
      duration,
      amdResult,
      mos: mosScore,
      human: isHuman,
      machine: isMachine,
    });
  }

  // ─── Caller ID resolution (graceful fallback) ────────────────────────────

  private resolveCallerId(campaign: any): string | null {
    // Priority: campaign callerIdNumber > SIP account callerIdNumber > SIP username > null
    const candidates = [
      campaign.callerIdNumber,
      campaign.sipAccount?.callerIdNumber,
      // Don't use SIP username as caller ID — many providers reject it
    ].filter(Boolean);

    const callerId = candidates[0] || null;

    if (!callerId) {
      this.logger.log(`No caller ID set — provider will assign default`);
    }

    return callerId;
  }

  // ─── SIP error parsing ────────────────────────────────────────────────────

  private parseSipError(raw: string): string {
    for (const [code, msg] of Object.entries(SIP_ERROR_MESSAGES)) {
      if (raw.includes(code)) return msg;
    }
    // Extract SIP response code if present (e.g. "403 Forbidden")
    const sipMatch = raw.match(/\b([4-6]\d{2})\b/);
    if (sipMatch) {
      const code = sipMatch[1];
      return SIP_ERROR_MESSAGES[code] || `SIP error ${code}`;
    }
    return raw.slice(0, 120);
  }

  private extractSipCode(raw: string): string | null {
    const match = raw.match(/\b([4-6]\d{2})\b/);
    return match ? match[1] : null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async failCampaign(campaignId: string, reason: string) {
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' as any, completedAt: new Date() },
    });
    this.logger.error(`Campaign ${campaignId} failed: ${reason}`);
  }

  @Process('pause')
  async handlePause(job: Job<{ campaignId: string }>) {
    this.activeWorkers.set(job.data.campaignId, false);
    this.logger.log(`Campaign ${job.data.campaignId} paused`);
  }

  @Process('stop')
  async handleStop(job: Job<{ campaignId: string }>) {
    this.activeWorkers.set(job.data.campaignId, false);
    this.logger.log(`Campaign ${job.data.campaignId} stopped`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Simple semaphore for concurrency control
class Semaphore {
  private count: number;
  private queue: Array<() => void> = [];

  constructor(max: number) { this.count = max; }

  acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return Promise.resolve();
    }
    return new Promise(resolve => this.queue.push(resolve));
  }

  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.count++;
    }
  }
}
