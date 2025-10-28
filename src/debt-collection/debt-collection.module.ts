import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';

// Controllers
import { DebtorsController } from './controllers/debtors.controller.js';
import { CampaignsController } from './controllers/campaigns.controller.js';
import { AgentApiController } from './controllers/agent-api.controller.js';
import { InboundWebhookController } from './controllers/inbound-webhook.controller.js';
import { PBXBridgeController } from './controllers/pbx-bridge.controller.js';

// Services
import { DebtorService } from './services/debtor.service.js';
import { CampaignService } from './services/campaign.service.js';
import { ContextBuilderService } from './services/context-builder.service.js';
import { PbxIntegrationService } from './services/pbx-integration.service.js';
import { LiveKitIntegrationService } from './services/livekit-integration.service.js';
import { CampaignOrchestratorService } from './services/campaign-orchestrator.service.js';

// Gateways
import { DebtCollectionGateway } from './gateways/debt-collection.gateway.js';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  controllers: [
    DebtorsController,
    CampaignsController,
    AgentApiController,
    InboundWebhookController,
    PBXBridgeController,
  ],
  providers: [
    DebtorService,
    CampaignService,
    ContextBuilderService,
    PbxIntegrationService,
    LiveKitIntegrationService,
    CampaignOrchestratorService,
    DebtCollectionGateway,
  ],
  exports: [
    DebtorService,
    CampaignService,
    CampaignOrchestratorService,
  ],
})
export class DebtCollectionModule {}
