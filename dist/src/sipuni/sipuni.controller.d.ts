import { SipuniService } from './sipuni.service.js';
export declare class SipuniController {
    private readonly sipuniService;
    private readonly logger;
    constructor(sipuniService: SipuniService);
    testConnection(organizationId: number): Promise<{
        success: boolean;
        message: string;
        config: {
            apiUrl: string;
            hasApiKey: boolean;
            hasUserId: boolean;
            source: string;
        };
        timestamp: string;
    } | {
        success: boolean;
        message: string;
        timestamp: string;
        config?: undefined;
    }>;
    syncAndProcess(organizationId: number, limit?: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
}
