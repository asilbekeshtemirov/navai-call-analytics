import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { SchedulerRegistry } from '@nestjs/schedule';
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
export declare class SipuniService implements OnModuleInit {
    private readonly config;
    private readonly prisma;
    private readonly http;
    private readonly aiService;
    private readonly schedulerRegistry;
    private readonly logger;
    private readonly saveDir;
    private sipuniApiUrl;
    private sipuniApiKey;
    private sipuniUserId;
    constructor(config: ConfigService, prisma: PrismaService, http: HttpService, aiService: AiService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): Promise<void>;
    private setupDynamicCronJob;
    private syncFromMonthStart;
    private formatDateForSipuni;
    private loadSipuniCredentials;
    private createHashString;
    exportStatistics(organizationId: number, exportDto: SipuniExportDto): Promise<string>;
    fetchCallRecords(organizationId: number, from: string, to: string): Promise<SipuniCallRecord[]>;
    private parseCsvToCallRecords;
    testConnection(organizationId: number): Promise<{
        apiUrl: string;
        hasApiKey: boolean;
        hasUserId: boolean;
        source: string;
    }>;
    manualSync(organizationId: number, from: string, to: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
    private processCallRecord;
    private downloadRecording;
    private transcribeAudio;
    fetchAllRecords(organizationId: number, limit?: number, order?: string, page?: number): Promise<SipuniRecord[]>;
    downloadRecordingById(organizationId: number, recordId: string, filename: string): Promise<string>;
    step1FetchAndSaveCSV(organizationId: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        totalRecords: number;
        csvPath: string;
    }>;
    step2ProcessCSVAndDownloadRecordings(organizationId: number, fromDate?: string, toDate?: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
    syncAndProcessRecordings(organizationId: number, limit?: number, fromDate?: string, toDate?: string): Promise<{
        success: boolean;
        message: string;
        recordsProcessed: number;
    }>;
    private parseSipuniDate;
    private saveRecordsToCSV;
    private updateCSVFromSipuni;
    private updateEmployeesFromCSV;
}
export {};
