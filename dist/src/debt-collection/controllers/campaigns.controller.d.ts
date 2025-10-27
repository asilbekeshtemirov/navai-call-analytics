import { CampaignService } from '../services/campaign.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { CreateCampaignDto } from '../dto/create-campaign.dto.js';
export declare class CampaignsController {
    private readonly campaignService;
    private readonly orchestratorService;
    constructor(campaignService: CampaignService, orchestratorService: CampaignOrchestratorService);
    create(organizationId: number, createCampaignDto: CreateCampaignDto, req: any): Promise<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DebtCampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        successfulCalls: number;
        dailyCallStartHour: number;
        dailyCallEndHour: number;
        maxCallsPerDay: number;
        totalDebtors: number;
        calledDebtors: number;
        promisesReceived: number;
        disputesReceived: number;
        createdBy: string | null;
    }>;
    findAll(organizationId: number): Promise<({
        _count: {
            debtors: number;
        };
    } & {
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DebtCampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        successfulCalls: number;
        dailyCallStartHour: number;
        dailyCallEndHour: number;
        maxCallsPerDay: number;
        totalDebtors: number;
        calledDebtors: number;
        promisesReceived: number;
        disputesReceived: number;
        createdBy: string | null;
    })[]>;
    findOne(id: string, organizationId: number): Promise<{
        debtors: ({
            debtor: {
                id: string;
                organizationId: number;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string;
                status: import("@prisma/client").$Enums.DebtorStatus;
                lastContactDate: Date | null;
                callAttempts: number;
                alternatePhone: string | null;
                email: string | null;
                debtAmount: number;
                currency: string;
                contractNumber: string;
                dueDate: Date;
                productService: string;
                debtReason: string | null;
                daysOverdue: number;
                maxCallAttempts: number;
                lastContactOutcome: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            campaignId: string;
            callStatus: import("@prisma/client").$Enums.DebtCallStatus;
            callAttempts: number;
            outcome: import("@prisma/client").$Enums.DebtCallOutcome | null;
            priority: number;
            debtorId: string;
            assignedAt: Date;
            lastCallAt: Date | null;
            nextCallAt: Date | null;
            liveKitRoomName: string | null;
            pbxCallId: string | null;
            callDurationSeconds: number | null;
            callContext: import("@prisma/client/runtime/library").JsonValue | null;
            promisedAmount: number | null;
            promisedDate: Date | null;
        })[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DebtCampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        successfulCalls: number;
        dailyCallStartHour: number;
        dailyCallEndHour: number;
        maxCallsPerDay: number;
        totalDebtors: number;
        calledDebtors: number;
        promisesReceived: number;
        disputesReceived: number;
        createdBy: string | null;
    }>;
    getProgress(id: string, organizationId: number): Promise<{
        campaign: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.DebtCampaignStatus;
            totalDebtors: number;
            calledDebtors: number;
            successfulCalls: number;
            failedCalls: number;
            promisesReceived: number;
            disputesReceived: number;
        };
        callStatusBreakdown: {
            status: any;
            count: any;
        }[];
        outcomeBreakdown: {
            outcome: any;
            count: any;
        }[];
    }>;
    start(id: string, organizationId: number): Promise<{
        message: string;
    }>;
    pause(id: string, organizationId: number): Promise<{
        message: string;
    }>;
    resume(id: string, organizationId: number): Promise<{
        message: string;
    }>;
    stop(id: string, organizationId: number): Promise<{
        message: string;
    }>;
    remove(id: string, organizationId: number): Promise<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DebtCampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        successfulCalls: number;
        dailyCallStartHour: number;
        dailyCallEndHour: number;
        maxCallsPerDay: number;
        totalDebtors: number;
        calledDebtors: number;
        promisesReceived: number;
        disputesReceived: number;
        createdBy: string | null;
    }>;
}
