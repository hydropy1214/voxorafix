import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignProcessor } from './campaign.processor';
import { SipServiceModule } from '../../services/sip/sip.module';

@Module({
  imports: [
    SipServiceModule,
    BullModule.registerQueue(
      { name: 'campaign' },
      { name: 'calls' },
    ),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignProcessor],
  exports: [CampaignsService],
})
export class CampaignsModule {}
