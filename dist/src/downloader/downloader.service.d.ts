import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
export declare class DownloaderService {
    private readonly configService;
    private readonly prisma;
    private readonly aiService;
    private readonly logger;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly saveDir;
    constructor(configService: ConfigService, prisma: PrismaService, aiService: AiService);
    handleCron(): Promise<void>;
    private downloadAndProcessCalls;
    private fetchTodayCalls;
    private downloadRecord;
}
