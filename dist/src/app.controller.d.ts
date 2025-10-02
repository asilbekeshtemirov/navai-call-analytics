import { AppService } from './app.service.js';
import { AiService } from './ai/ai.service.js';
export declare class AppController {
    private readonly appService;
    private readonly aiService;
    constructor(appService: AppService, aiService: AiService);
    getHello(): string;
    testLlm(): Promise<string>;
    processAllCalls(): Promise<{
        message: string;
    }>;
    reprocessErrorCalls(): Promise<{
        message: string;
    }>;
    resetStuckCalls(): Promise<{
        message: string;
    }>;
}
