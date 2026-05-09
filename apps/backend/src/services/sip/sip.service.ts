import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { FreeswitchEslService } from './freeswitch-esl.service';

@Injectable()
export class SipService {
  private readonly logger = new Logger(SipService.name);

  constructor(
    private prisma: PrismaService,
    private esl: FreeswitchEslService,
    private eventEmitter: EventEmitter2,
  ) {}

  async originate(params: {
    destination: string;
    gateway: string;
    callerIdNumber?: string;
    callerIdName?: string;
    audioFile?: string;
    voicemailAudio?: string;
    campaignId?: string;
    amdEnabled?: boolean;
    amdAction?: string;
    timeout?: number;
  }) {
    return this.esl.originate(params);
  }

  /**
   * Campaign calls are finalized inside CampaignProcessor after originate().
   * Quick-dial calls have no campaign — finalize hangup here only.
   */
  @OnEvent('freeswitch.channel_hangup_complete')
  async handleCallHangup(payload: {
    uuid: string;
    campaignId?: string;
    hangupCause: string;
    duration: number;
    amdResult?: string;
    rtpPacketsLost?: string;
    rtpMos?: number;
  }) {
    if (!payload.uuid) return;

    const callLog = await this.prisma.callLog.findFirst({
      where: { uuid: payload.uuid },
    });

    if (!callLog) return;

    if (callLog.campaignId) {
      return;
    }

    const isAnswered = !['USER_BUSY', 'NO_ANSWER', 'NO_USER_RESPONSE', 'NORMAL_TEMPORARY_FAILURE'].includes(
      payload.hangupCause,
    ) && payload.duration > 0;
    const isBusy = payload.hangupCause === 'USER_BUSY';
    const isNoAnswer = ['NO_ANSWER', 'NO_USER_RESPONSE'].includes(payload.hangupCause);
    const status = isAnswered ? 'COMPLETED' : isBusy ? 'BUSY' : isNoAnswer ? 'NOANSWER' : 'FAILED';

    await this.prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        status: status as any,
        hangupCause: payload.hangupCause,
        hangupAt: new Date(),
        duration: payload.duration,
        billableDuration: payload.duration,
        amdResult: payload.amdResult as any,
        rtpMos: payload.rtpMos,
        rtpPacketsLost: payload.rtpPacketsLost ? parseInt(payload.rtpPacketsLost, 10) : undefined,
      },
    });

    this.eventEmitter.emit('call.completed', {
      userId: callLog.userId,
      campaignId: null,
      uuid: payload.uuid,
      phone: callLog.phone,
      duration: payload.duration,
      amdResult: payload.amdResult,
      status,
      hangupCause: payload.hangupCause,
    });

    this.logger.debug(`Quick-dial ${payload.uuid} completed: ${payload.hangupCause} (${payload.duration}s)`);
  }

  @OnEvent('freeswitch.channel_answer')
  async handleCallAnswer(payload: { uuid: string; answeredAt: string }) {
    if (!payload.uuid) return;
    await this.prisma.callLog.updateMany({
      where: { uuid: payload.uuid },
      data: { status: 'ANSWERED', answeredAt: new Date(payload.answeredAt) },
    });
  }

  @OnEvent('freeswitch.channel_progress')
  async handleCallRinging(payload: { uuid: string }) {
    if (!payload.uuid) return;
    await this.prisma.callLog.updateMany({
      where: { uuid: payload.uuid },
      data: { status: 'RINGING' },
    });
  }
}
