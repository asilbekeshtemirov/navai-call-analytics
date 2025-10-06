import { SipuniService } from './sipuni.service.js';
export declare class SipuniController {
    private readonly sipuniService;
    private readonly logger;
    constructor(sipuniService: SipuniService);
    testConnection(): Promise<{
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
    syncAndProcess(limit?: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
}
