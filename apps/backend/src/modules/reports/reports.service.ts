import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, CallStatus } from '@prisma/client';

export type CallLogSourceFilter = 'all' | 'campaign' | 'quick_dial';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async listCallLogs(
    userId: string,
    opts: {
      page?: number;
      limit?: number;
      status?: string;
      campaignId?: string;
      phone?: string;
      from?: string;
      to?: string;
      source?: CallLogSourceFilter;
    },
  ) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 25));

    const where: Prisma.CallLogWhereInput = { userId };

    if (opts.campaignId) {
      where.campaignId = opts.campaignId;
    } else if (opts.source === 'quick_dial') {
      where.campaignId = null;
    } else if (opts.source === 'campaign') {
      where.campaignId = { not: null };
    }

    if (opts.status) {
      const allowed = Object.values(CallStatus) as string[];
      if (allowed.includes(opts.status)) {
        where.status = opts.status as CallStatus;
      }
    }

    if (opts.phone?.trim()) {
      const digits = opts.phone.replace(/\D/g, '');
      where.phone = digits.length > 0 ? { contains: digits } : { contains: opts.phone.trim() };
    }

    if (opts.from || opts.to) {
      where.createdAt = {};
      if (opts.from) where.createdAt.gte = new Date(opts.from);
      if (opts.to) where.createdAt.lte = new Date(opts.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.callLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      }),
      this.prisma.callLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }
}
