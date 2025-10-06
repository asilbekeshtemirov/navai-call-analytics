import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { SipuniExportDto } from './dto/sipuni-export.dto.js';
import { SipuniCallRecord } from './dto/sipuni-record.dto.js';
interface SipuniRecord {
    type: string;
    status: string;
    time: string;
    tree: string;
    from: string;
    to: string;
    answered: string;
    duration: string;
    talkDuration: string;
    answerTime: string;
    rating: string;
    recordId: string;
    label: string;
    tags: string;
    orderId: string;
    recordExists: string;
    newClient: string;
}
export declare class SipuniService {
    private readonly config;
    private readonly prisma;
    private readonly http;
    private readonly aiService;
    private readonly logger;
    private readonly saveDir;
    private sipuniApiUrl;
    private sipuniApiKey;
    private sipuniUserId;
    constructor(config: ConfigService, prisma: PrismaService, http: HttpService, aiService: AiService);
    private loadSipuniCredentials;
    private createHashString;
    exportStatistics(exportDto: SipuniExportDto): Promise<string>;
    fetchCallRecords(from: string, to: string): Promise<SipuniCallRecord[]>;
    private parseCsvToCallRecords;
    testConnection(): Promise<{
        apiUrl: string;
        hasApiKey: boolean;
        hasUserId: boolean;
        source: string;
    }>;
    manualSync(from: string, to: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
    private processCallRecord;
    private downloadRecording;
    private transcribeAudio;
    fetchAllRecords(limit?: number, order?: string, page?: number): Promise<SipuniRecord[]>;
    downloadRecordingById(recordId: string, filename: string): Promise<string>;
    syncAndProcessRecordings(limit?: number): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
    private parseSipuniDate;
    dailySipuniSync(): Promise<void>;
}
export {};
