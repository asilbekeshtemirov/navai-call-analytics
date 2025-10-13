import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
export interface TranscriptSegment {
    speaker: 'agent' | 'customer';
    text: string;
    startMs: number;
    endMs: number;
}
export interface AnalysisResult {
    overallScore: number;
    criteriaScores: Array<{
        criteriaId: string;
        score: number;
        notes?: string;
    }>;
    violations: Array<{
        type: string;
        timestampMs: number;
        details?: string;
    }>;
    summary?: string;
}
interface QueueItem {
    callId: string;
    audioFileUrl: string;
    priority: number;
}
export declare class AiService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly geminiAi;
    private transcriptionQueue;
    private isProcessingQueue;
    constructor(prisma: PrismaService, config: ConfigService);
    transcribeAudio(audioFileUrl: string, retryCount?: number): Promise<TranscriptSegment[]>;
    private shouldRetrySTT;
    analyzeTranscript(callId: string, segments: TranscriptSegment[]): Promise<AnalysisResult>;
    private buildAnalysisPrompt;
    addToTranscriptionQueue(callId: string, audioFileUrl: string, priority?: number): Promise<void>;
    private processTranscriptionQueue;
    getQueueStatus(): {
        queueLength: number;
        isProcessing: boolean;
        items: QueueItem[];
    };
    processCall(callId: string): Promise<void>;
    generateContent(contents: string, model?: string): Promise<string>;
    processAllUploadedCalls(): Promise<void>;
    private deleteAudioFile;
}
export {};
