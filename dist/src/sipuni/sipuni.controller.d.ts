import { SipuniService } from './sipuni.service.js';
import { ConfigService } from '@nestjs/config';
export declare class SipuniController {
    private readonly sipuniService;
    private readonly config;
    private readonly logger;
    constructor(sipuniService: SipuniService, config: ConfigService);
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
    syncAndProcess(organizationId: number, limit?: string, from?: string, to?: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
}
export declare class SipuniWebhookController {
    private readonly sipuniService;
    private readonly config;
    private readonly logger;
    constructor(sipuniService: SipuniService, config: ConfigService);
    handleWebhook(apiKey: string, body: {
        organizationId?: number;
        limit?: number;
        from?: string;
        to?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            message: string;
            recordsProcessed: number;
        };
        timestamp: string;
    } | {
        success: boolean;
        message: string;
        timestamp: string;
        data?: undefined;
    }>;
}
