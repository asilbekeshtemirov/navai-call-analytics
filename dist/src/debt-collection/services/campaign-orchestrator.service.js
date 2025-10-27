var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CampaignOrchestratorService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CampaignService } from './campaign.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { PbxIntegrationService } from './pbx-integration.service.js';
import { LiveKitIntegrationService } from './livekit-integration.service.js';
import { DebtCollectionGateway } from '../gateways/debt-collection.gateway.js';
let CampaignOrchestratorService = CampaignOrchestratorService_1 = class CampaignOrchestratorService {
    prisma;
    campaignService;
    contextBuilder;
    pbxService;
    livekitService;
    gateway;
    logger = new Logger(CampaignOrchestratorService_1.name);
    activeCampaigns = new Map();
    constructor(prisma, campaignService, contextBuilder, pbxService, livekitService, gateway) {
        this.prisma = prisma;
        this.campaignService = campaignService;
        this.contextBuilder = contextBuilder;
        this.pbxService = pbxService;
        this.livekitService = livekitService;
        this.gateway = gateway;
    }
    async startCampaign(campaignId, organizationId) {
        const campaign = await this.campaignService.findOne(campaignId, organizationId);
        if (campaign.status === 'RUNNING') {
            throw new Error('Kampaniya allaqachon ishlamoqda');
        }
        await this.campaignService.updateStatus(campaignId, organizationId, 'RUNNING');
        this.logger.log(`Starting campaign: ${campaign.name} (${campaignId})`);
        this.processCampaign(campaignId, organizationId);
        this.gateway.emitCampaignUpdate(organizationId, {
            campaignId,
            status: 'RUNNING',
            message: 'Kampaniya boshlandi',
        });
    }
    async pauseCampaign(campaignId, organizationId) {
        const campaign = await this.campaignService.findOne(campaignId, organizationId);
        if (campaign.status !== 'RUNNING') {
            throw new Error('Kampaniya ishlamayapti');
        }
        const interval = this.activeCampaigns.get(campaignId);
        if (interval) {
            clearTimeout(interval);
            this.activeCampaigns.delete(campaignId);
        }
        await this.campaignService.updateStatus(campaignId, organizationId, 'PAUSED');
        this.logger.log(`Paused campaign: ${campaignId}`);
        this.gateway.emitCampaignUpdate(organizationId, {
            campaignId,
            status: 'PAUSED',
            message: 'Kampaniya to\'xtatildi',
        });
    }
    async resumeCampaign(campaignId, organizationId) {
        const campaign = await this.campaignService.findOne(campaignId, organizationId);
        if (campaign.status !== 'PAUSED') {
            throw new Error('Kampaniya to\'xtatilmagan');
        }
        await this.campaignService.updateStatus(campaignId, organizationId, 'RUNNING');
        this.logger.log(`Resuming campaign: ${campaignId}`);
        this.processCampaign(campaignId, organizationId);
        this.gateway.emitCampaignUpdate(organizationId, {
            campaignId,
            status: 'RUNNING',
            message: 'Kampaniya davom ettirildi',
        });
    }
    async stopCampaign(campaignId, organizationId) {
        const interval = this.activeCampaigns.get(campaignId);
        if (interval) {
            clearTimeout(interval);
            this.activeCampaigns.delete(campaignId);
        }
        await this.campaignService.updateStatus(campaignId, organizationId, 'STOPPED');
        this.logger.log(`Stopped campaign: ${campaignId}`);
        this.gateway.emitCampaignUpdate(organizationId, {
            campaignId,
            status: 'STOPPED',
            message: 'Kampaniya to\'xtatildi',
        });
    }
    async processCampaign(campaignId, organizationId) {
        try {
            const campaign = await this.prisma.debtCampaign.findUnique({
                where: { id: campaignId },
            });
            if (!campaign || campaign.status !== 'RUNNING') {
                this.logger.log(`Campaign ${campaignId} is not running, stopping processing`);
                return;
            }
            const now = new Date();
            const currentHour = now.getHours();
            if (currentHour < campaign.dailyCallStartHour || currentHour >= campaign.dailyCallEndHour) {
                this.logger.log(`Outside calling hours for campaign ${campaignId}, will retry later`);
                const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 30 * 60 * 1000);
                this.activeCampaigns.set(campaignId, timeout);
                return;
            }
            const nextAssignment = await this.getNextDebtor(campaignId);
            if (!nextAssignment) {
                this.logger.log(`No more debtors to call in campaign ${campaignId}`);
                await this.campaignService.updateStatus(campaignId, organizationId, 'COMPLETED');
                this.gateway.emitCampaignUpdate(organizationId, {
                    campaignId,
                    status: 'COMPLETED',
                    message: 'Kampaniya yakunlandi',
                });
                return;
            }
            await this.processCall(nextAssignment, campaignId, organizationId);
            const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 5000);
            this.activeCampaigns.set(campaignId, timeout);
        }
        catch (error) {
            this.logger.error(`Error processing campaign ${campaignId}: ${error.message}`);
            this.logger.error(error.stack);
            const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 60000);
            this.activeCampaigns.set(campaignId, timeout);
        }
    }
    async getNextDebtor(campaignId) {
        return this.prisma.debtCampaignDebtor.findFirst({
            where: {
                campaignId,
                callStatus: 'PENDING',
            },
            include: {
                debtor: true,
            },
            orderBy: {
                priority: 'asc',
            },
        });
    }
    async processCall(assignment, campaignId, organizationId) {
        const { debtor } = assignment;
        this.logger.log(`Processing call for debtor: ${debtor.firstName} ${debtor.lastName} (${debtor.phone})`);
        try {
            await this.prisma.debtCampaignDebtor.update({
                where: { id: assignment.id },
                data: {
                    callStatus: 'CALLING',
                    callAttempts: { increment: 1 },
                    lastCallAt: new Date(),
                },
            });
            const roomName = `debt-call-${assignment.id}-${Date.now()}`;
            const context = await this.contextBuilder.buildContext(debtor.id, campaignId, roomName, assignment.id);
            await this.livekitService.createRoom(roomName, context);
            const roomUrl = this.livekitService.getRoomUrl(roomName);
            const callResult = await this.pbxService.initiateCall(debtor.phone, {
                livekit_room: roomUrl,
                room_name: roomName,
                debtor_id: debtor.id,
            });
            await this.prisma.debtCampaignDebtor.update({
                where: { id: assignment.id },
                data: {
                    liveKitRoomName: roomName,
                    pbxCallId: callResult.callId,
                },
            });
            this.logger.log(`Call initiated successfully for ${debtor.phone}. Room: ${roomName}, PBX Call ID: ${callResult.callId}`);
            this.gateway.emitCallInitiated(organizationId, {
                campaignId,
                debtorId: debtor.id,
                debtorName: `${debtor.firstName} ${debtor.lastName}`,
                roomName,
                callId: callResult.callId,
            });
            await this.campaignService.incrementProgress(campaignId, 'calledDebtors');
        }
        catch (error) {
            this.logger.error(`Failed to process call for debtor ${debtor.id}: ${error.message}`);
            await this.prisma.debtCampaignDebtor.update({
                where: { id: assignment.id },
                data: {
                    callStatus: 'FAILED',
                    notes: `Qo'ng'iroq boshlanmadi: ${error.message}`,
                },
            });
            await this.campaignService.incrementProgress(campaignId, 'failedCalls');
        }
    }
    async handleCallCompletion(roomName, outcome) {
        const assignment = await this.prisma.debtCampaignDebtor.findUnique({
            where: { liveKitRoomName: roomName },
            include: {
                campaign: true,
                debtor: true,
            },
        });
        if (!assignment) {
            this.logger.warn(`Assignment not found for room: ${roomName}`);
            return;
        }
        this.logger.log(`Handling call completion for room: ${roomName}, outcome: ${outcome.outcome}`);
        const updateData = {
            callStatus: outcome.outcome === 'NO_ANSWER' || outcome.outcome === 'FAILED' ? 'FAILED' : 'SUCCESS',
            outcome: outcome.outcome,
            notes: outcome.notes,
        };
        if (outcome.promisedAmount) {
            updateData.promisedAmount = outcome.promisedAmount;
        }
        if (outcome.promisedDate) {
            updateData.promisedDate = new Date(outcome.promisedDate);
        }
        await this.prisma.debtCampaignDebtor.update({
            where: { id: assignment.id },
            data: updateData,
        });
        if (updateData.callStatus === 'SUCCESS') {
            await this.campaignService.incrementProgress(assignment.campaignId, 'successfulCalls');
        }
        else {
            await this.campaignService.incrementProgress(assignment.campaignId, 'failedCalls');
        }
        if (outcome.outcome === 'PROMISE') {
            await this.campaignService.incrementProgress(assignment.campaignId, 'promisesReceived');
        }
        if (outcome.outcome === 'DISPUTED') {
            await this.campaignService.incrementProgress(assignment.campaignId, 'disputesReceived');
        }
        await this.prisma.debtor.update({
            where: { id: assignment.debtorId },
            data: {
                lastContactDate: new Date(),
                lastContactOutcome: outcome.outcome,
                callAttempts: { increment: 1 },
            },
        });
        try {
            await this.livekitService.deleteRoom(roomName);
        }
        catch (error) {
            this.logger.error(`Failed to delete room ${roomName}: ${error.message}`);
        }
        this.gateway.emitCallCompleted(assignment.campaign.organizationId, {
            campaignId: assignment.campaignId,
            debtorId: assignment.debtorId,
            outcome: outcome.outcome,
            promisedAmount: outcome.promisedAmount,
            promisedDate: outcome.promisedDate,
        });
    }
};
CampaignOrchestratorService = CampaignOrchestratorService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        CampaignService,
        ContextBuilderService,
        PbxIntegrationService,
        LiveKitIntegrationService,
        DebtCollectionGateway])
], CampaignOrchestratorService);
export { CampaignOrchestratorService };
//# sourceMappingURL=campaign-orchestrator.service.js.map