import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
export declare class DownloaderService {
    private readonly config;
    private readonly prisma;
    private readonly http;
    private readonly aiService;
    private readonly logger;
    private readonly saveDir;
    private sipApiUrl;
    private sipApiKey;
    constructor(config: ConfigService, prisma: PrismaService, http: HttpService, aiService: AiService);
    private getApiSettings;
    private initApiSettings;
    handleCron(): Promise<void>;
    private downloadAndProcessCalls;
    private fetchTodayCalls;
    private downloadRecord;
}
