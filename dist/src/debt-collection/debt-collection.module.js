var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DebtorsController } from './controllers/debtors.controller.js';
import { CampaignsController } from './controllers/campaigns.controller.js';
import { AgentApiController } from './controllers/agent-api.controller.js';
import { InboundWebhookController } from './controllers/inbound-webhook.controller.js';
import { PBXBridgeController } from './controllers/pbx-bridge.controller.js';
import { DebtorService } from './services/debtor.service.js';
import { CampaignService } from './services/campaign.service.js';
import { ContextBuilderService } from './services/context-builder.service.js';
import { PbxIntegrationService } from './services/pbx-integration.service.js';
import { LiveKitIntegrationService } from './services/livekit-integration.service.js';
import { CampaignOrchestratorService } from './services/campaign-orchestrator.service.js';
import { DebtCollectionGateway } from './gateways/debt-collection.gateway.js';
let DebtCollectionModule = class DebtCollectionModule {
};
DebtCollectionModule = __decorate([
    Module({
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
], DebtCollectionModule);
export { DebtCollectionModule };
//# sourceMappingURL=debt-collection.module.js.map