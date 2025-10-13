import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs';
import { Prisma } from '@prisma/client';

export interface TranscriptSegment {
  speaker: 'agent' | 'customer';
  text: string;
  startMs: number;
  endMs: number;
}

export interface AnalysisResult {
  overallScore: number;
  criteriaScores: Array<{ criteriaId: string; score: number; notes?: string }>;
  violations: Array<{ type: string; timestampMs: number; details?: string }>;
  summary?: string;
}

interface Criteria {
  id: string;
  name: string;
  weight: number;
  description: string | null;
}

interface QueueItem {
  callId: string;
  audioFileUrl: string;
  priority: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiAi: GoogleGenerativeAI;
  private transcriptionQueue: QueueItem[] = [];
  private isProcessingQueue = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const geminiApiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey) {
      this.logger.error('GEMINI_API_KEY is not set in environment variables.');
      throw new Error('Gemini API key is missing.');
    }
    this.geminiAi = new GoogleGenerativeAI(geminiApiKey);
  }

  async transcribeAudio(audioFileUrl: string, retryCount: number = 0): Promise<TranscriptSegment[]> {
    this.logger.log(`Transcribing audio from file: ${audioFileUrl}`);

    const sttApiUrl =
      this.config.get<string>('STT_API_URL') ||
      'https://ai.navai.pro/v1/asr/transcribe';

    const sttApiKey = this.config.get<string>('STT_API_KEY');
    if (!sttApiKey) {
      this.logger.error('STT_API_KEY is not set in environment variables.');
      throw new Error('STT API key is missing.');
    }

    if (!fs.existsSync(audioFileUrl)) {
      this.logger.error(`Audio file not found: ${audioFileUrl}`);
      return [];
    }

    const maxRetries = 3;
    const fileStats = fs.statSync(audioFileUrl);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

    // Dynamic timeout based on file size - no limit mentioned, so we can handle large files
    // Base: 10 minutes (600000ms) + 3 minutes per MB
    const baseTimeout = 600000; // 10 minutes base
    const perMbTimeout = 180000; // 3 minutes per MB
    const dynamicTimeout = baseTimeout + (fileStats.size / (1024 * 1024)) * perMbTimeout;
    const timeout = Math.min(dynamicTimeout, 7200000); // Max 120 minutes (2 hours) for very large files

    this.logger.log(`[STT] File size: ${fileSizeMB}MB, Timeout: ${Math.round(timeout / 1000)}s`);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFileUrl));

      this.logger.log(`[STT] Uploading audio file to: ${sttApiUrl}`);
      this.logger.log(`[STT] File path: ${audioFileUrl}`);
      this.logger.log(`[STT] Attempt ${retryCount + 1}/${maxRetries + 1}`);

      const response = await axios.post(sttApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'X-API-Key': sttApiKey,
        },
        timeout: timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      this.logger.log(`[STT] Response status: ${response.status}`);
      this.logger.log(
        `[STT] Response data: ${JSON.stringify(response.data).substring(0, 500)}`,
      );

      // Check for 400 error with inappropriate content message
      if (response.status === 400 && response.data?.detail?.includes('inappropriate')) {
        this.logger.warn(`[STT] Content flagged as inappropriate by moderation system`);
        throw new Error('Transcribed content flagged as inappropriate by moderation system');
      }

      // New API returns: { text: string, language: string, duration: number }
      if (response.data && response.data.text) {
        const transcriptText = response.data.text;
        const duration = response.data.duration || 0;

        // Parse the text into segments (simple split by sentences or periods)
        const sentences = transcriptText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
        const segmentDuration = duration > 0 ? (duration * 1000) / sentences.length : 5000;

        const segments: TranscriptSegment[] = sentences.map((text: string, index: number) => ({
          speaker: 'agent', // Default to agent, can be enhanced later
          text: text.trim(),
          startMs: Math.floor(index * segmentDuration),
          endMs: Math.floor((index + 1) * segmentDuration),
        }));

        this.logger.log(
          `[STT] Successfully transcribed ${segments.length} segments from ${duration}s audio`,
        );
        return segments;
      }

      this.logger.warn(
        '[STT] API returned unexpected format - no text found',
      );
      this.logger.warn(`[STT] Full response: ${JSON.stringify(response.data)}`);
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`[STT] Axios error: ${error.message}`);
        this.logger.error(`[STT] Error code: ${error.code}`);

        // Check if we should retry
        const shouldRetry = this.shouldRetrySTT(error, retryCount, maxRetries);

        if (error.response) {
          this.logger.error(`[STT] Response status: ${error.response.status}`);

          // Handle 400 Bad Request for inappropriate content
          if (error.response.status === 400) {
            const errorDetail = error.response.data?.detail || '';
            if (errorDetail.includes('inappropriate')) {
              this.logger.warn(`[STT] Audio content flagged as inappropriate`);
              throw new Error('Audio contains inappropriate language and cannot be processed');
            }
          }

          if (error.response.status === 413) {
            this.logger.warn(`[STT] File too large (${fileSizeMB}MB) - Payload Too Large error`);
            // Don't retry 413 errors, they won't succeed
          } else if (shouldRetry) {
            this.logger.warn(`[STT] Retrying... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1))); // Exponential backoff
            return this.transcribeAudio(audioFileUrl, retryCount + 1);
          }

          this.logger.error(
            `[STT] Response data: ${JSON.stringify(error.response.data)}`,
          );
          this.logger.error(
            `[STT] Response headers: ${JSON.stringify(error.response.headers)}`,
          );
        } else if (error.request) {
          this.logger.error('[STT] No response received from server');

          if (shouldRetry) {
            this.logger.warn(`[STT] Retrying after network error... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
            return this.transcribeAudio(audioFileUrl, retryCount + 1);
          }
        }
      } else if (error instanceof Error) {
        this.logger.error(`[STT] Error: ${error.message}`);
        this.logger.error(`[STT] Stack: ${error.stack}`);
      } else {
        this.logger.error('[STT] Unknown error occurred');
      }

      this.logger.warn('[STT] All retry attempts exhausted or non-retryable error');
      throw error;
    }
  }

  /**
   * Determine if STT request should be retried
   */
  private shouldRetrySTT(error: any, retryCount: number, maxRetries: number): boolean {
    if (retryCount >= maxRetries) {
      return false; // Max retries reached
    }

    if (axios.isAxiosError(error)) {
      // Retry on timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return true;
      }

      // Retry on network errors
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return true;
      }

      // Retry on 5xx server errors
      if (error.response && error.response.status >= 500 && error.response.status < 600) {
        return true;
      }

      // Retry on 429 (Too Many Requests)
      if (error.response && error.response.status === 429) {
        return true;
      }
    }

    return false;
  }

  async analyzeTranscript(
    callId: string,
    segments: TranscriptSegment[],
  ): Promise<AnalysisResult> {
    this.logger.log(`Analyzing transcript for call: ${callId}`);

    const criteria = await this.prisma.criteria.findMany();
    const settings = await this.prisma.setting.findFirst();
    const maxScore = settings?.scoringMode === 'HUNDRED' ? 100 : 10;

    const fullTranscript = segments
      .map((s) => `[${s.speaker}]: ${s.text}`)
      .join('\n');

    const prompt = this.buildAnalysisPrompt(fullTranscript, criteria, maxScore);

    try {
      const model = this.geminiAi.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      const geminiResponse = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const analysisText = geminiResponse.response.text();
      if (!analysisText) {
        throw new Error('Gemini API did not return any text for analysis.');
      }

      this.logger.log(`[LLM] Raw response text from Gemini: ${analysisText}`);

      // Clean the response by removing markdown wrapper
      const cleanedJson = analysisText.replace(/```json\n|```/g, '').trim();

      try {
        const rawAnalysis = JSON.parse(cleanedJson);

        // Map LLM response to our interface
        const analysis: AnalysisResult = {
          overallScore: rawAnalysis.overall_score,
          criteriaScores: Object.entries(rawAnalysis.criterion_scores).map(
            ([name, score]) => {
              const criterion = criteria.find((c) => c.name === name);
              return {
                criteriaId: criterion ? criterion.id : name, // Use name as fallback
                score: score as number,
                notes: `Criterion: ${name}`,
              };
            },
          ),
          violations: rawAnalysis.violations_mistakes.map((v: any) => ({
            type: (v.description || 'Unknown violation').substring(0, 250), // Limit to 250 chars
            timestampMs: 0, // LLM not providing this reliably yet
            details: `Timestamp: ${v.timestamp}`.substring(0, 250), // Limit to 250 chars
          })),
          summary: rawAnalysis.summary_of_performance,
        };

        this.logger.log(
          `[LLM] Mapped analysis JSON for call ${callId}: ${JSON.stringify(analysis, null, 2)}`,
        );
        this.logger.log(
          `Analysis complete for call ${callId}: score ${analysis.overallScore}`,
        );
        return analysis;
      } catch (error) {
        this.logger.error(
          'Error parsing or mapping Gemini API response:',
          error,
        );
        throw new Error('Failed to parse or map analysis from Gemini API.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          'Error calling Gemini API for analysis:',
          error.message,
        );
      } else {
        this.logger.error(
          'An unknown error occurred while calling Gemini API for analysis.',
        );
      }
      throw new Error('Failed to analyze transcript with Gemini API.');
    }
  }

  private buildAnalysisPrompt(
    transcript: string,
    criteria: Criteria[],
    maxScore: number,
  ): string {
    const criteriaList = criteria
      .map(
        (c) =>
          `- ${c.name} (og'irligi: ${c.weight}): ${c.description || "Tavsif yo'q"}`,
      )
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
    ${criteria.map((c) => `"${c.name}": <ball 0-${maxScore} orasida>`).join(',\n    ')}
  },
  "violations_mistakes": [
    {"description": "Xato tavsifi", "timestamp": "00:00"}
  ],
  "summary_of_performance": "Qisqacha xulosa O'zbek tilida"
}

MUHIM: Javobda faqat JSON bo'lishi kerak, hech qanday qo'shimcha matn yoki tushuntirish bermaslik kerak.
    `.trim();
  }

  /**
   * Add a call to the transcription queue for sequential processing
   */
  async addToTranscriptionQueue(callId: string, audioFileUrl: string, priority: number = 0): Promise<void> {
    this.logger.log(`Adding call ${callId} to transcription queue (priority: ${priority})`);

    // Check if already in queue
    const existsInQueue = this.transcriptionQueue.some(item => item.callId === callId);
    if (existsInQueue) {
      this.logger.warn(`Call ${callId} already in queue, skipping`);
      return;
    }

    this.transcriptionQueue.push({ callId, audioFileUrl, priority });

    // Sort by priority (higher priority first)
    this.transcriptionQueue.sort((a, b) => b.priority - a.priority);

    this.logger.log(`Queue size: ${this.transcriptionQueue.length}`);

    // Start processing if not already running
    if (!this.isProcessingQueue) {
      this.processTranscriptionQueue();
    }
  }

  /**
   * Process the transcription queue sequentially
   * Each audio file waits for the previous one to complete STT before starting
   */
  private async processTranscriptionQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      this.logger.log('Queue processor already running');
      return;
    }

    this.isProcessingQueue = true;
    this.logger.log('Starting queue processor...');

    while (this.transcriptionQueue.length > 0) {
      const item = this.transcriptionQueue.shift();
      if (!item) break;

      this.logger.log(`Processing queue item: ${item.callId} (${this.transcriptionQueue.length} remaining)`);

      try {
        // Process this call completely (transcribe + analyze)
        await this.processCall(item.callId);
        this.logger.log(`Successfully processed call ${item.callId} from queue`);

        // Small delay between items to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Failed to process call ${item.callId} from queue: ${error.message}`);
        // Continue with next item even if this one fails
      }
    }

    this.isProcessingQueue = false;
    this.logger.log('Queue processor finished - all items processed');
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean; items: QueueItem[] } {
    return {
      queueLength: this.transcriptionQueue.length,
      isProcessing: this.isProcessingQueue,
      items: [...this.transcriptionQueue],
    };
  }

  /**
   * Process a call: transcribe + analyze + save results
   */
  async processCall(callId: string): Promise<void> {
    this.logger.log(`Processing call: ${callId}`);

    try {
      // Update status to PROCESSING
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'PROCESSING' },
      });

      // Get call details
      const call = await this.prisma.call.findUnique({ where: { id: callId } });
      if (!call) {
        throw new Error(`Call ${callId} not found`);
      }

      // Step 1: Transcribe audio (or use existing transcription)
      let segments: TranscriptSegment[] = [];

      if (call.transcription && call.transcription.trim() !== '') {
        // Use existing transcription if available
        this.logger.log(`Using existing transcription for call ${callId}`);
        const existingSegments = await this.prisma.transcriptSegment.findMany({
          where: { callId },
          orderBy: { startMs: 'asc' },
        });

        if (existingSegments.length > 0) {
          segments = existingSegments.map((seg) => ({
            speaker: seg.speaker as 'agent' | 'customer',
            text: seg.text,
            startMs: seg.startMs,
            endMs: seg.endMs,
          }));
        } else {
          // Parse transcription text into segments
          const lines = call.transcription.split('\n');
          segments = lines
            .map((line, index) => ({
              speaker: line.startsWith('[agent]')
                ? ('agent' as const)
                : ('customer' as const),
              text: line.replace(/^\[(agent|customer)\]:\s*/, ''),
              startMs: index * 1000,
              endMs: (index + 1) * 1000,
            }))
            .filter((seg) => seg.text.trim() !== '');
        }
      } else {
        // Try to transcribe from audio file
        segments = await this.transcribeAudio(call.fileUrl);
      }

      if (segments.length === 0) {
        this.logger.warn(
          `No transcription available for call ${callId}. Marking as UPLOADED.`,
        );
        // Update status back to UPLOADED if no transcription
        await this.prisma.call.update({
          where: { id: callId },
          data: {
            status: 'UPLOADED',
            transcription:
              'Transcription not available - STT service not configured',
          },
        });
        return;
      }

      const fullTranscript = segments
        .map((s) => `[${s.speaker}]: ${s.text}`)
        .join('\n');

      // Save transcript segments to database
      await this.prisma.transcriptSegment.createMany({
        data: segments.map((seg) => ({
          callId,
          startMs: seg.startMs,
          endMs: seg.endMs,
          speaker: seg.speaker,
          text: seg.text,
        })),
      });

      // Update call with transcription
      await this.prisma.call.update({
        where: { id: callId },
        data: {
          transcription: fullTranscript,
          durationSec:
            Math.floor(segments[segments.length - 1]?.endMs / 1000) || 0,
        },
      });

      // Step 2: Analyze transcript
      const analysis = await this.analyzeTranscript(callId, segments);

      // Save analysis results
      await this.prisma.call.update({
        where: { id: callId },
        data: { analysis: analysis as unknown as Prisma.JsonObject },
      });

      // Delete existing scores first (to avoid unique constraint error)
      await this.prisma.callScore.deleteMany({
        where: { callId },
      });

      // Save new scores
      await this.prisma.callScore.createMany({
        data: analysis.criteriaScores.map((cs) => ({
          callId,
          criteriaId: cs.criteriaId,
          score: cs.score,
          notes: cs.notes,
        })),
      });

      // Delete existing violations first
      await this.prisma.violation.deleteMany({
        where: { callId },
      });

      // Save new violations
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

      // Update status to DONE
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'DONE' },
      });

      // Audio faylni o'chirish
      await this.deleteAudioFile(call.fileUrl);

      this.logger.log(`Call ${callId} processed successfully`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to process call ${callId}: ${error.message}`);
      } else {
        this.logger.error(
          `An unknown error occurred while processing call ${callId}.`,
        );
      }

      // Try to get call details to delete audio file
      try {
        const call = await this.prisma.call.findUnique({
          where: { id: callId },
        });
        if (call && call.fileUrl && fs.existsSync(call.fileUrl)) {
          fs.unlinkSync(call.fileUrl);
          this.logger.log(`Deleted audio file after error: ${call.fileUrl}`);
        }
      } catch (deleteError) {
        this.logger.warn(
          `Failed to delete audio file after error: ${deleteError.message}`,
        );
      }

      // Update status to ERROR
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'ERROR' },
      });

      throw error;
    }
  }

  async generateContent(
    contents: string,
    model: string = 'gemini-2.5-flash',
  ): Promise<string> {
    try {
      const generativeModel = this.geminiAi.getGenerativeModel({
        model: model,
      });
      const response = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: contents }] }],
      });
      if (!response.response.text()) {
        throw new Error('Gemini API did not return any text.');
      }
      return response.response.text();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          'Error generating content with Gemini API:',
          error.message,
        );
      } else {
        this.logger.error(
          'An unknown error occurred while generating content with Gemini API.',
        );
      }
      throw new Error('Failed to generate content with Gemini API.');
    }
  }

  /**
   * Process all uploaded calls that haven't been analyzed yet
   * Uses sequential queue to ensure proper ordering and avoid overwhelming STT API
   */
  async processAllUploadedCalls(): Promise<void> {
    this.logger.log('Starting to process all uploaded calls...');

    try {
      // Get all calls with UPLOADED status
      const uploadedCalls = await this.prisma.call.findMany({
        where: { status: 'UPLOADED' },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.log(
        `Found ${uploadedCalls.length} uploaded calls to process`,
      );

      if (uploadedCalls.length === 0) {
        this.logger.log('No uploaded calls found to process');
        return;
      }

      // Add all calls to the queue with priority based on creation time
      // Older calls get higher priority
      let priority = uploadedCalls.length;
      for (const call of uploadedCalls) {
        this.logger.log(`Adding call ${call.id} (${call.externalId}) to queue with priority ${priority}`);
        await this.addToTranscriptionQueue(call.id, call.fileUrl, priority);
        priority--;
      }

      this.logger.log('All uploaded calls added to processing queue');
      this.logger.log(`Queue status: ${JSON.stringify(this.getQueueStatus())}`);
    } catch (error) {
      this.logger.error(`Error in processAllUploadedCalls: ${error.message}`);
      throw error;
    }
  }

  // Audio faylni o'chirish metodi
  private async deleteAudioFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Audio file deleted: ${filePath}`);
      } else {
        this.logger.warn(`Audio file not found for deletion: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete audio file ${filePath}: ${error.message}`,
      );
      // Don't throw error - file deletion failure shouldn't stop the process
    }
  }
}
