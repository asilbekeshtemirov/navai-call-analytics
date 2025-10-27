var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let CampaignService = class CampaignService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, dto, userId) {
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
        const assignments = debtors.map((debtor, index) => ({
            campaignId: campaign.id,
            debtorId: debtor.id,
            priority: index,
        }));
        await this.prisma.debtCampaignDebtor.createMany({
            data: assignments,
        });
        return campaign;
    }
    async findAll(organizationId) {
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
    async findOne(id, organizationId) {
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
    async getProgress(id, organizationId) {
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
            callStatusBreakdown: callStatusCounts.map((s) => ({
                status: s.callStatus,
                count: s._count,
            })),
            outcomeBreakdown: outcomeCounts.map((o) => ({
                outcome: o.outcome,
                count: o._count,
            })),
        };
    }
    async updateStatus(id, organizationId, status) {
        const campaign = await this.findOne(id, organizationId);
        const updateData = { status };
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
    async incrementProgress(campaignId, field) {
        return this.prisma.debtCampaign.update({
            where: { id: campaignId },
            data: {
                [field]: { increment: 1 },
            },
        });
    }
    async delete(id, organizationId) {
        const campaign = await this.findOne(id, organizationId);
        if (campaign.status === 'RUNNING') {
            throw new BadRequestException('Faol kampaniyani o\'chirib bo\'lmaydi. Avval to\'xtatib qo\'ying');
        }
        return this.prisma.debtCampaign.delete({
            where: { id },
        });
    }
};
CampaignService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CampaignService);
export { CampaignService };
//# sourceMappingURL=campaign.service.js.map