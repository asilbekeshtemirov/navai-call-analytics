import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCampaignDto } from '../dto/create-campaign.dto.js';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: number, dto: CreateCampaignDto, userId?: string) {
    // Validate debtors exist and belong to organization
    const debtors = await this.prisma.debtor.findMany({
      where: {
        id: { in: dto.debtorIds },
        organizationId,
        status: 'ACTIVE',
      },
    });

    if (debtors.length === 0) {
      throw new BadRequestException('Aktiv qarzdorlar topilmadi');
    }

    if (debtors.length !== dto.debtorIds.length) {
      throw new BadRequestException('Ba\'zi qarzdorlar topilmadi yoki aktiv emas');
    }

    // Create campaign
    const campaign = await this.prisma.debtCampaign.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        dailyCallStartHour: dto.dailyCallStartHour ?? 9,
        dailyCallEndHour: dto.dailyCallEndHour ?? 18,
        maxCallsPerDay: dto.maxCallsPerDay ?? 100,
        totalDebtors: debtors.length,
        createdBy: userId,
      },
    });

    // Assign debtors to campaign
    const assignments = debtors.map((debtor: any, index: number) => ({
      campaignId: campaign.id,
      debtorId: debtor.id,
      priority: index,
    }));

    await this.prisma.debtCampaignDebtor.createMany({
      data: assignments,
    });

    return campaign;
  }

  async findAll(organizationId: number) {
    return this.prisma.debtCampaign.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { debtors: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: number) {
    const campaign = await this.prisma.debtCampaign.findFirst({
      where: { id, organizationId },
      include: {
        debtors: {
          include: {
            debtor: true,
          },
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Kampaniya topilmadi');
    }

    return campaign;
  }

  async getProgress(id: string, organizationId: number) {
    const campaign = await this.findOne(id, organizationId);

    const callStatusCounts = await this.prisma.debtCampaignDebtor.groupBy({
      by: ['callStatus'],
      where: { campaignId: id },
      _count: true,
    });

    const outcomeCounts = await this.prisma.debtCampaignDebtor.groupBy({
      by: ['outcome'],
      where: {
        campaignId: id,
        outcome: { not: null },
      },
      _count: true,
    });

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalDebtors: campaign.totalDebtors,
        calledDebtors: campaign.calledDebtors,
        successfulCalls: campaign.successfulCalls,
        failedCalls: campaign.failedCalls,
        promisesReceived: campaign.promisesReceived,
        disputesReceived: campaign.disputesReceived,
      },
      callStatusBreakdown: callStatusCounts.map((s: any) => ({
        status: s.callStatus,
        count: s._count,
      })),
      outcomeBreakdown: outcomeCounts.map((o: any) => ({
        outcome: o.outcome,
        count: o._count,
      })),
    };
  }

  async updateStatus(id: string, organizationId: number, status: string) {
    const campaign = await this.findOne(id, organizationId);

    const updateData: any = { status };

    if (status === 'RUNNING' && !campaign.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'STOPPED') {
      updateData.completedAt = new Date();
    }

    return this.prisma.debtCampaign.update({
      where: { id },
      data: updateData,
    });
  }

  async incrementProgress(campaignId: string, field: 'calledDebtors' | 'successfulCalls' | 'failedCalls' | 'promisesReceived' | 'disputesReceived') {
    return this.prisma.debtCampaign.update({
      where: { id: campaignId },
      data: {
        [field]: { increment: 1 },
      },
    });
  }

  async delete(id: string, organizationId: number) {
    const campaign = await this.findOne(id, organizationId);

    if (campaign.status === 'RUNNING') {
      throw new BadRequestException('Faol kampaniyani o\'chirib bo\'lmaydi. Avval to\'xtatib qo\'ying');
    }

    return this.prisma.debtCampaign.delete({
      where: { id },
    });
  }
}
