var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
let AiService = AiService_1 = class AiService {
    prisma;
    config;
    logger = new Logger(AiService_1.name);
    geminiAi;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const geminiApiKey = this.config.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            this.logger.error('GEMINI_API_KEY is not set in environment variables.');
            throw new Error('Gemini API key is missing.');
        }
        this.geminiAi = new GoogleGenAI({ apiKey: geminiApiKey });
    }
    async transcribeAudio(audioFileUrl) {
        this.logger.log(`Transcribing audio from URL: ${audioFileUrl}`);
        const sttApiUrl = 'https://api.example-stt.com/v1/transcribe';
        const apiKey = this.config.get('STT_API_KEY');
        try {
            const response = await axios.post(sttApiUrl, {
                audio_url: audioFileUrl,
                diarization: true,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.segments;
        }
        catch (error) {
            this.logger.error('Error calling STT API:', error.message);
            throw new Error('Failed to transcribe audio.');
        }
    }
    async analyzeTranscript(callId, segments) {
        this.logger.log(`Analyzing transcript for call: ${callId}`);
        const criteria = await this.prisma.criteria.findMany();
        const settings = await this.prisma.setting.findFirst();
        const maxScore = settings?.scoringMode === 'HUNDRED' ? 100 : 10;
        const fullTranscript = segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');
        const prompt = this.buildAnalysisPrompt(fullTranscript, criteria, maxScore);
        try {
            const geminiResponse = await this.geminiAi.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                },
            });
            const analysisText = geminiResponse.text;
            if (!analysisText) {
                throw new Error('Gemini API did not return any text for analysis.');
            }
            const analysis = JSON.parse(analysisText);
            this.logger.log(`Analysis complete for call ${callId}: score ${analysis.overallScore}`);
            return analysis;
        }
        catch (error) {
            this.logger.error('Error calling Gemini API for analysis:', error);
            throw new Error('Failed to analyze transcript with Gemini API.');
        }
    }
    buildAnalysisPrompt(transcript, criteria, maxScore) {
        const criteriaList = criteria.map(c => `- ${c.name} (weight: ${c.weight}): ${c.description || 'N/A'}`).join('\n');
        return `
You are an expert call quality analyst. Analyze the following call transcript and provide scores based on these criteria:

${criteriaList}

Transcript:
${transcript}

Provide:
1. Overall score (0-${maxScore})
2. Score for each criterion (0-${maxScore})
3. List of violations/mistakes with timestamps
4. Brief summary of performance

Respond in JSON format.
    `.trim();
    }
    async processCall(callId) {
        this.logger.log(`Processing call: ${callId}`);
        try {
            await this.prisma.call.update({
                where: { id: callId },
                data: { status: 'PROCESSING' },
            });
            const call = await this.prisma.call.findUnique({ where: { id: callId } });
            if (!call) {
                throw new Error(`Call ${callId} not found`);
            }
            const segments = await this.transcribeAudio(call.fileUrl);
            const fullTranscript = segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');
            await this.prisma.transcriptSegment.createMany({
                data: segments.map(seg => ({
                    callId,
                    startMs: seg.startMs,
                    endMs: seg.endMs,
                    speaker: seg.speaker,
                    text: seg.text,
                })),
            });
            await this.prisma.call.update({
                where: { id: callId },
                data: {
                    transcription: fullTranscript,
                    durationSec: Math.floor(segments[segments.length - 1]?.endMs / 1000) || 0,
                },
            });
            const analysis = await this.analyzeTranscript(callId, segments);
            await this.prisma.call.update({
                where: { id: callId },
                data: { analysis: analysis },
            });
            await this.prisma.callScore.createMany({
                data: analysis.criteriaScores.map(cs => ({
                    callId,
                    criteriaId: cs.criteriaId,
                    score: cs.score,
                    notes: cs.notes,
                })),
            });
            if (analysis.violations.length > 0) {
                await this.prisma.violation.createMany({
                    data: analysis.violations.map(v => ({
                        callId,
                        type: v.type,
                        timestampMs: v.timestampMs,
                        details: v.details,
                    })),
                });
            }
            await this.prisma.call.update({
                where: { id: callId },
                data: { status: 'DONE' },
            });
            this.logger.log(`Call ${callId} processed successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to process call ${callId}: ${error.message}`);
            await this.prisma.call.update({
                where: { id: callId },
                data: { status: 'ERROR' },
            });
            throw error;
        }
    }
    async generateContent(contents, model = 'gemini-2.5-flash') {
        try {
            const response = await this.geminiAi.models.generateContent({
                model: model,
                contents: contents,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                },
            });
            if (!response.text) {
                throw new Error('Gemini API did not return any text.');
            }
            return response.text;
        }
        catch (error) {
            this.logger.error('Error generating content with Gemini API:', error);
            throw new Error('Failed to generate content with Gemini API.');
        }
    }
};
AiService = AiService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], AiService);
export { AiService };
//# sourceMappingURL=ai.service.js.map