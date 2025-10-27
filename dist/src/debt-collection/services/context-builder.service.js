var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let ContextBuilderService = class ContextBuilderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildContext(debtorId, campaignId, roomName, assignmentId) {
        const debtor = await this.prisma.debtor.findUnique({
            where: { id: debtorId },
            include: {
                organization: true,
            },
        });
        if (!debtor) {
            throw new Error('Qarzdor topilmadi');
        }
        const context = {
            debtor: {
                id: debtor.id,
                firstName: debtor.firstName,
                lastName: debtor.lastName,
                phone: debtor.phone,
            },
            debt: {
                amount: debtor.debtAmount,
                currency: debtor.currency,
                contractNumber: debtor.contractNumber,
                dueDate: debtor.dueDate.toISOString().split('T')[0],
                daysOverdue: debtor.daysOverdue,
                productService: debtor.productService,
            },
            organization: {
                id: debtor.organization.id,
                name: debtor.organization.name,
            },
            callId: assignmentId,
            roomName: roomName,
            timestamp: new Date().toISOString(),
        };
        await this.prisma.debtCampaignDebtor.update({
            where: { id: assignmentId },
            data: { callContext: context },
        });
        return context;
    }
    async getContextByRoomName(roomName) {
        const assignment = await this.prisma.debtCampaignDebtor.findUnique({
            where: { liveKitRoomName: roomName },
        });
        if (!assignment || !assignment.callContext) {
            return null;
        }
        return assignment.callContext;
    }
    async getContextByPhoneNumber(phone) {
        const phoneDigits = phone.replace(/\D/g, '');
        const debtor = await this.prisma.debtor.findFirst({
            where: {
                phone: {
                    contains: phoneDigits,
                },
            },
        });
        if (!debtor) {
            return null;
        }
        const assignment = await this.prisma.debtCampaignDebtor.findFirst({
            where: {
                debtorId: debtor.id,
                callStatus: {
                    in: ['PENDING', 'FAILED'],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                campaign: true,
            },
        });
        if (!assignment) {
            return null;
        }
        const roomName = `inbound-${phoneDigits}-${Date.now()}`;
        const context = await this.buildContext(debtor.id, assignment.campaignId, roomName, assignment.id);
        await this.prisma.debtCampaignDebtor.update({
            where: { id: assignment.id },
            data: {
                liveKitRoomName: roomName,
                callContext: context,
                callStatus: 'CALLING',
            },
        });
        return context;
    }
};
ContextBuilderService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ContextBuilderService);
export { ContextBuilderService };
//# sourceMappingURL=context-builder.service.js.map