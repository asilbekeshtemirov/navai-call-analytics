import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CampaignService } from './campaign.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { PbxIntegrationService } from './pbx-integration.service.js';
import { LiveKitIntegrationService } from './livekit-integration.service.js';
import { DebtCollectionGateway } from '../gateways/debt-collection.gateway.js';

@Injectable()
export class CampaignOrchestratorService {
  private readonly logger = new Logger(CampaignOrchestratorService.name);
  private activeCampaigns: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private prisma: PrismaService,
    private campaignService: CampaignService,
    private contextBuilder: ContextBuilderService,
    private pbxService: PbxIntegrationService,
    private livekitService: LiveKitIntegrationService,
    private gateway: DebtCollectionGateway,
  ) {}

  async startCampaign(campaignId: string, organizationId: number): Promise<void> {
    const campaign = await this.campaignService.findOne(campaignId, organizationId);

    if (campaign.status === 'RUNNING') {
      throw new Error('Kampaniya allaqachon ishlamoqda');
    }

    // Update campaign status
    await this.campaignService.updateStatus(campaignId, organizationId, 'RUNNING');

    this.logger.log(`Starting campaign: ${campaign.name} (${campaignId})`);

    // Start processing calls
    this.processCampaign(campaignId, organizationId);

    // Emit event
    this.gateway.emitCampaignUpdate(organizationId, {
      campaignId,
      status: 'RUNNING',
      message: 'Kampaniya boshlandi',
    });
  }

  async pauseCampaign(campaignId: string, organizationId: number): Promise<void> {
    const campaign = await this.campaignService.findOne(campaignId, organizationId);

    if (campaign.status !== 'RUNNING') {
      throw new Error('Kampaniya ishlamayapti');
    }

    // Clear interval if exists
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

  async resumeCampaign(campaignId: string, organizationId: number): Promise<void> {
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

  async stopCampaign(campaignId: string, organizationId: number): Promise<void> {
    // Clear interval if exists
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

  private async processCampaign(campaignId: string, organizationId: number): Promise<void> {
    try {
      // Check if campaign is still running
      const campaign = await this.prisma.debtCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign || campaign.status !== 'RUNNING') {
        this.logger.log(`Campaign ${campaignId} is not running, stopping processing`);
        return;
      }

      // Check time restrictions
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour < campaign.dailyCallStartHour || currentHour >= campaign.dailyCallEndHour) {
        this.logger.log(`Outside calling hours for campaign ${campaignId}, will retry later`);
        // Schedule next check in 30 minutes
        const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 30 * 60 * 1000);
        this.activeCampaigns.set(campaignId, timeout);
        return;
      }

      // Get next pending debtor
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

      // Process this call
      await this.processCall(nextAssignment, campaignId, organizationId);

      // Schedule next call after 5 seconds
      const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 5000);
      this.activeCampaigns.set(campaignId, timeout);

    } catch (error) {
      this.logger.error(`Error processing campaign ${campaignId}: ${error.message}`);
      this.logger.error(error.stack);

      // Retry after 1 minute
      const timeout = setTimeout(() => this.processCampaign(campaignId, organizationId), 60000);
      this.activeCampaigns.set(campaignId, timeout);
    }
  }

  private async getNextDebtor(campaignId: string): Promise<any> {
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

  private async processCall(assignment: any, campaignId: string, organizationId: number): Promise<void> {
    const { debtor } = assignment;

    this.logger.log(`Processing call for debtor: ${debtor.firstName} ${debtor.lastName} (${debtor.phone})`);

    try {
      // Update status to CALLING
      await this.prisma.debtCampaignDebtor.update({
        where: { id: assignment.id },
        data: {
          callStatus: 'CALLING',
          callAttempts: { increment: 1 },
          lastCallAt: new Date(),
        },
      });

      // Generate unique room name
      const roomName = `debt-call-${assignment.id}-${Date.now()}`;

      // Build context
      const context = await this.contextBuilder.buildContext(
        debtor.id,
        campaignId,
        roomName,
        assignment.id,
      );

      // Create LiveKit room
      await this.livekitService.createRoom(roomName, context);

      const roomUrl = this.livekitService.getRoomUrl(roomName);

      // Initiate PBX call
      const callResult = await this.pbxService.initiateCall(debtor.phone, {
        livekit_room: roomUrl,
        room_name: roomName,
        debtor_id: debtor.id,
      });

      // Update assignment with room and call details
      await this.prisma.debtCampaignDebtor.update({
        where: { id: assignment.id },
        data: {
          liveKitRoomName: roomName,
          pbxCallId: callResult.callId,
        },
      });

      this.logger.log(`Call initiated successfully for ${debtor.phone}. Room: ${roomName}, PBX Call ID: ${callResult.callId}`);

      // Emit event
      this.gateway.emitCallInitiated(organizationId, {
        campaignId,
        debtorId: debtor.id,
        debtorName: `${debtor.firstName} ${debtor.lastName}`,
        roomName,
        callId: callResult.callId,
      });

      // Increment campaign progress
      await this.campaignService.incrementProgress(campaignId, 'calledDebtors');

    } catch (error) {
      this.logger.error(`Failed to process call for debtor ${debtor.id}: ${error.message}`);

      // Mark as FAILED
      await this.prisma.debtCampaignDebtor.update({
        where: { id: assignment.id },
        data: {
          callStatus: 'FAILED',
          notes: `Qo'ng'iroq boshlanmadi: ${error.message}`,
        },
      });

      // Increment failed calls
      await this.campaignService.incrementProgress(campaignId, 'failedCalls');
    }
  }

  async handleCallCompletion(roomName: string, outcome: any): Promise<void> {
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

    // Update assignment
    const updateData: any = {
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

    // Update campaign counters
    if (updateData.callStatus === 'SUCCESS') {
      await this.campaignService.incrementProgress(assignment.campaignId, 'successfulCalls');
    } else {
      await this.campaignService.incrementProgress(assignment.campaignId, 'failedCalls');
    }

    if (outcome.outcome === 'PROMISE') {
      await this.campaignService.incrementProgress(assignment.campaignId, 'promisesReceived');
    }

    if (outcome.outcome === 'DISPUTED') {
      await this.campaignService.incrementProgress(assignment.campaignId, 'disputesReceived');
    }

    // Update debtor
    await this.prisma.debtor.update({
      where: { id: assignment.debtorId },
      data: {
        lastContactDate: new Date(),
        lastContactOutcome: outcome.outcome,
        callAttempts: { increment: 1 },
      },
    });

    // Cleanup LiveKit room
    try {
      await this.livekitService.deleteRoom(roomName);
    } catch (error) {
      this.logger.error(`Failed to delete room ${roomName}: ${error.message}`);
    }

    // Emit event
    this.gateway.emitCallCompleted(assignment.campaign.organizationId, {
      campaignId: assignment.campaignId,
      debtorId: assignment.debtorId,
      outcome: outcome.outcome,
      promisedAmount: outcome.promisedAmount,
      promisedDate: outcome.promisedDate,
    });
  }
}
