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
import { GoogleGenerativeAI } from '@google/generative-ai';
import FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs';
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
        this.geminiAi = new GoogleGenerativeAI(geminiApiKey);
    }
    async transcribeAudio(audioFileUrl) {
        this.logger.log(`Transcribing audio from file: ${audioFileUrl}`);
        const sttApiUrl = this.config.get('STT_API_URL') || 'https://ai.navai.pro/v1/asr/transcribe';
        if (!fs.existsSync(audioFileUrl)) {
            this.logger.error(`Audio file not found: ${audioFileUrl}`);
            return [];
        }
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFileUrl));
            formData.append('diarization', 'true');
            formData.append('language', 'uz');
            this.logger.log(`[STT] Uploading audio file to: ${sttApiUrl}`);
            this.logger.log(`[STT] File path: ${audioFileUrl}`);
            this.logger.log(`[STT] File size: ${fs.statSync(audioFileUrl).size} bytes`);
            const response = await axios.post(sttApiUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 300000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            this.logger.log(`[STT] Response status: ${response.status}`);
            this.logger.log(`[STT] Response data: ${JSON.stringify(response.data).substring(0, 500)}`);
            if (response.data && response.data.segments) {
                const segments = response.data.segments.map((seg) => ({
                    speaker: seg.speaker || 'agent',
                    text: seg.text || '',
                    startMs: seg.start_ms || seg.startMs || 0,
                    endMs: seg.end_ms || seg.endMs || 0,
                }));
                this.logger.log(`[STT] Successfully transcribed ${segments.length} segments`);
                return segments;
            }
            this.logger.warn('[STT] API returned unexpected format - no segments found');
            this.logger.warn(`[STT] Full response: ${JSON.stringify(response.data)}`);
            return [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger.error(`[STT] Axios error: ${error.message}`);
                this.logger.error(`[STT] Error code: ${error.code}`);
                if (error.response) {
                    this.logger.error(`[STT] Response status: ${error.response.status}`);
                    this.logger.error(`[STT] Response data: ${JSON.stringify(error.response.data)}`);
                    this.logger.error(`[STT] Response headers: ${JSON.stringify(error.response.headers)}`);
                }
                else if (error.request) {
                    this.logger.error('[STT] No response received from server');
                    this.logger.error(`[STT] Request details: ${error.request}`);
                }
            }
            else if (error instanceof Error) {
                this.logger.error(`[STT] Error: ${error.message}`);
                this.logger.error(`[STT] Stack: ${error.stack}`);
            }
            else {
                this.logger.error('[STT] Unknown error occurred');
            }
            this.logger.warn('[STT] Returning empty transcript due to error');
            return [];
        }
    }
    async analyzeTranscript(callId, segments) {
        this.logger.log(`Analyzing transcript for call: ${callId}`);
        const criteria = await this.prisma.criteria.findMany();
        const settings = await this.prisma.setting.findFirst();
        const maxScore = settings?.scoringMode === 'HUNDRED' ? 100 : 10;
        const fullTranscript = segments
            .map((s) => `[${s.speaker}]: ${s.text}`)
            .join('\n');
        const prompt = this.buildAnalysisPrompt(fullTranscript, criteria, maxScore);
        try {
            const model = this.geminiAi.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const geminiResponse = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            const analysisText = geminiResponse.response.text();
            if (!analysisText) {
                throw new Error('Gemini API did not return any text for analysis.');
            }
            this.logger.log(`[LLM] Raw response text from Gemini: ${analysisText}`);
            const cleanedJson = analysisText.replace(/```json\n|```/g, '').trim();
            try {
                const rawAnalysis = JSON.parse(cleanedJson);
                const analysis = {
                    overallScore: rawAnalysis.overall_score,
                    criteriaScores: Object.entries(rawAnalysis.criterion_scores).map(([name, score]) => {
                        const criterion = criteria.find(c => c.name === name);
                        return {
                            criteriaId: criterion ? criterion.id : name,
                            score: score,
                            notes: `Criterion: ${name}`
                        };
                    }),
                    violations: rawAnalysis.violations_mistakes.map((v) => ({
                        type: (v.description || 'Unknown violation').substring(0, 250),
                        timestampMs: 0,
                        details: `Timestamp: ${v.timestamp}`.substring(0, 250)
                    })),
                    summary: rawAnalysis.summary_of_performance,
                };
                this.logger.log(`[LLM] Mapped analysis JSON for call ${callId}: ${JSON.stringify(analysis, null, 2)}`);
                this.logger.log(`Analysis complete for call ${callId}: score ${analysis.overallScore}`);
                return analysis;
            }
            catch (error) {
                this.logger.error('Error parsing or mapping Gemini API response:', error);
                throw new Error('Failed to parse or map analysis from Gemini API.');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Error calling Gemini API for analysis:', error.message);
            }
            else {
                this.logger.error('An unknown error occurred while calling Gemini API for analysis.');
            }
            throw new Error('Failed to analyze transcript with Gemini API.');
        }
    }
    buildAnalysisPrompt(transcript, criteria, maxScore) {
        const criteriaNames = criteria.map(c => `"${c.name}"`).join(', ');
        const criteriaList = criteria
            .map((c) => `- ${c.name} (og'irligi: ${c.weight}): ${c.description || 'Tavsif yo\'q'}`)
            .join('\n');
        return `
Siz qo'ng'iroq sifatini tahlil qiluvchi mutaxassassiz. Quyidagi qo'ng'iroq transkripsiyasini tahlil qiling va ushbu mezonlar asosida ball bering:

${criteriaList}

Transkripsiya:
${transcript}

Javobni AYNAN quyidagi JSON formatida bering:
{
  "overall_score": <umumiy ball 0-${maxScore} orasida>,
  "criterion_scores": {
    ${criteria.map(c => `"${c.name}": <ball 0-${maxScore} orasida>`).join(',\n    ')}
  },
  "violations_mistakes": [
    {"description": "Xato tavsifi", "timestamp": "00:00"}
  ],
  "summary_of_performance": "Qisqacha xulosa O'zbek tilida"
}

MUHIM: Javobda faqat JSON bo'lishi kerak, hech qanday qo'shimcha matn yoki tushuntirish bermaslik kerak.
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
            let segments = [];
            if (call.transcription && call.transcription.trim() !== '') {
                this.logger.log(`Using existing transcription for call ${callId}`);
                const existingSegments = await this.prisma.transcriptSegment.findMany({
                    where: { callId },
                    orderBy: { startMs: 'asc' }
                });
                if (existingSegments.length > 0) {
                    segments = existingSegments.map(seg => ({
                        speaker: seg.speaker,
                        text: seg.text,
                        startMs: seg.startMs,
                        endMs: seg.endMs
                    }));
                }
                else {
                    const lines = call.transcription.split('\n');
                    segments = lines.map((line, index) => ({
                        speaker: line.startsWith('[agent]') ? 'agent' : 'customer',
                        text: line.replace(/^\[(agent|customer)\]:\s*/, ''),
                        startMs: index * 1000,
                        endMs: (index + 1) * 1000
                    })).filter(seg => seg.text.trim() !== '');
                }
            }
            else {
                segments = await this.transcribeAudio(call.fileUrl);
            }
            if (segments.length === 0) {
                this.logger.warn(`No transcription available for call ${callId}. Marking as UPLOADED.`);
                await this.prisma.call.update({
                    where: { id: callId },
                    data: {
                        status: 'UPLOADED',
                        transcription: 'Transcription not available - STT service not configured',
                    },
                });
                return;
            }
            const fullTranscript = segments
                .map((s) => `[${s.speaker}]: ${s.text}`)
                .join('\n');
            await this.prisma.transcriptSegment.createMany({
                data: segments.map((seg) => ({
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
            try {
                if (fs.existsSync(call.fileUrl)) {
                    fs.unlinkSync(call.fileUrl);
                    this.logger.log(`Deleted audio file: ${call.fileUrl}`);
                }
            }
            catch (deleteError) {
                this.logger.warn(`Failed to delete audio file ${call.fileUrl}: ${deleteError.message}`);
            }
            const analysis = await this.analyzeTranscript(callId, segments);
            await this.prisma.call.update({
                where: { id: callId },
                data: { analysis: analysis },
            });
            await this.prisma.callScore.deleteMany({
                where: { callId }
            });
            await this.prisma.callScore.createMany({
                data: analysis.criteriaScores.map((cs) => ({
                    callId,
                    criteriaId: cs.criteriaId,
                    score: cs.score,
                    notes: cs.notes,
                })),
            });
            await this.prisma.violation.deleteMany({
                where: { callId }
            });
            if (analysis.violations.length > 0) {
                await this.prisma.violation.createMany({
                    data: analysis.violations.map((v) => ({
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
            await this.deleteAudioFile(call.fileUrl);
            this.logger.log(`Call ${callId} processed successfully`);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to process call ${callId}: ${error.message}`);
            }
            else {
                this.logger.error(`An unknown error occurred while processing call ${callId}.`);
            }
            try {
                const call = await this.prisma.call.findUnique({ where: { id: callId } });
                if (call && call.fileUrl && fs.existsSync(call.fileUrl)) {
                    fs.unlinkSync(call.fileUrl);
                    this.logger.log(`Deleted audio file after error: ${call.fileUrl}`);
                }
            }
            catch (deleteError) {
                this.logger.warn(`Failed to delete audio file after error: ${deleteError.message}`);
            }
            await this.prisma.call.update({
                where: { id: callId },
                data: { status: 'ERROR' },
            });
            throw error;
        }
    }
    async generateContent(contents, model = 'gemini-2.5-flash') {
        try {
            const generativeModel = this.geminiAi.getGenerativeModel({ model: model });
            const response = await generativeModel.generateContent({ contents: [{ role: 'user', parts: [{ text: contents }] }] });
            if (!response.response.text()) {
                throw new Error('Gemini API did not return any text.');
            }
            return response.response.text();
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Error generating content with Gemini API:', error.message);
            }
            else {
                this.logger.error('An unknown error occurred while generating content with Gemini API.');
            }
            throw new Error('Failed to generate content with Gemini API.');
        }
    }
    async processAllUploadedCalls() {
        this.logger.log('Starting to process all uploaded calls...');
        try {
            const uploadedCalls = await this.prisma.call.findMany({
                where: { status: 'UPLOADED' },
                orderBy: { createdAt: 'asc' },
            });
            this.logger.log(`Found ${uploadedCalls.length} uploaded calls to process`);
            if (uploadedCalls.length === 0) {
                this.logger.log('No uploaded calls found to process');
                return;
            }
            for (const call of uploadedCalls) {
                try {
                    this.logger.log(`Processing call: ${call.id} (${call.externalId})`);
                    await this.processCall(call.id);
                    this.logger.log(`Successfully processed call: ${call.id}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                catch (error) {
                    this.logger.error(`Failed to process call ${call.id}: ${error.message}`);
                }
            }
            this.logger.log('Finished processing all uploaded calls');
        }
        catch (error) {
            this.logger.error(`Error in processAllUploadedCalls: ${error.message}`);
            throw error;
        }
    }
    async deleteAudioFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                this.logger.log(`Audio file deleted: ${filePath}`);
            }
            else {
                this.logger.warn(`Audio file not found for deletion: ${filePath}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete audio file ${filePath}: ${error.message}`);
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