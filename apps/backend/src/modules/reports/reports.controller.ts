import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService, CallLogSourceFilter } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('call-logs')
  @ApiOperation({ summary: 'Search and export-oriented call history for the signed-in user' })
  callLogs(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('campaignId') campaignId?: string,
    @Query('phone') phone?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('source') source?: CallLogSourceFilter,
  ) {
    return this.reports.listCallLogs(req.user.id, {
      page: page ? +page : 1,
      limit: limit ? +limit : 25,
      status,
      campaignId,
      phone,
      from,
      to,
      source: source ?? 'all',
    });
  }
}
