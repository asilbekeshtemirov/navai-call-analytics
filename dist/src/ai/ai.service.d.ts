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
export declare class AiService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly geminiAi;
    constructor(prisma: PrismaService, config: ConfigService);
    transcribeAudio(audioFileUrl: string): Promise<TranscriptSegment[]>;
    analyzeTranscript(callId: string, segments: TranscriptSegment[]): Promise<AnalysisResult>;
    private buildAnalysisPrompt;
    processCall(callId: string): Promise<void>;
    generateContent(contents: string, model?: string): Promise<string>;
    processAllUploadedCalls(): Promise<void>;
}
