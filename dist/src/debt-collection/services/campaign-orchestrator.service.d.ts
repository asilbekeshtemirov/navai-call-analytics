import { PrismaService } from '../../prisma/prisma.service.js';
import { CampaignService } from './campaign.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { PbxIntegrationService } from './pbx-integration.service.js';
import { LiveKitIntegrationService } from './livekit-integration.service.js';
import { DebtCollectionGateway } from '../gateways/debt-collection.gateway.js';
export declare class CampaignOrchestratorService {
    private prisma;
    private campaignService;
    private contextBuilder;
    private pbxService;
    private livekitService;
    private gateway;
    private readonly logger;
    private activeCampaigns;
    constructor(prisma: PrismaService, campaignService: CampaignService, contextBuilder: ContextBuilderService, pbxService: PbxIntegrationService, livekitService: LiveKitIntegrationService, gateway: DebtCollectionGateway);
    startCampaign(campaignId: string, organizationId: number): Promise<void>;
    pauseCampaign(campaignId: string, organizationId: number): Promise<void>;
    resumeCampaign(campaignId: string, organizationId: number): Promise<void>;
    stopCampaign(campaignId: string, organizationId: number): Promise<void>;
    private processCampaign;
    private getNextDebtor;
    private processCall;
    handleCallCompletion(roomName: string, outcome: any): Promise<void>;
}
