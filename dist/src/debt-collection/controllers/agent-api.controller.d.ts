import { ContextBuilderService } from '../services/context-builder.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { RecordOutcomeDto } from '../dto/call-outcome.dto.js';
export declare class AgentApiController {
    private readonly contextBuilder;
    private readonly orchestrator;
    constructor(contextBuilder: ContextBuilderService, orchestrator: CampaignOrchestratorService);
    getContext(roomName: string): Promise<import("../services/context-builder.service.js").DebtCallContext>;
    getContextByPhone(phone: string): Promise<import("../services/context-builder.service.js").DebtCallContext>;
    recordOutcome(roomName: string, outcomeDto: RecordOutcomeDto): Promise<{
        message: string;
    }>;
    recordPromise(roomName: string, data: {
        promisedAmount: number;
        promisedDate: string;
        notes?: string;
    }): Promise<{
        message: string;
    }>;
    recordDispute(roomName: string, data: {
        notes: string;
    }): Promise<{
        message: string;
    }>;
    addNote(roomName: string, data: {
        note: string;
    }): Promise<{
        message: string;
    }>;
}
