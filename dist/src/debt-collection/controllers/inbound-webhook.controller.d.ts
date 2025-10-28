import { ContextBuilderService } from '../services/context-builder.service.js';
import { LiveKitIntegrationService } from '../services/livekit-integration.service.js';
export declare class InboundWebhookController {
    private readonly contextBuilder;
    private readonly livekitService;
    private readonly logger;
    constructor(contextBuilder: ContextBuilderService, livekitService: LiveKitIntegrationService);
    handleInboundCallStarted(data: {
        phone: string;
        roomName: string;
        callId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        debtor: {
            id: string;
            name: string;
        };
        debt: {
            amount: number;
            currency: string;
        };
    } | {
        success: boolean;
        message: any;
        debtor?: undefined;
        debt?: undefined;
    }>;
}
