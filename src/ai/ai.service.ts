import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

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



@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiAi: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const geminiApiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey) {
      this.logger.error('GEMINI_API_KEY is not set in environment variables.');
      throw new Error('Gemini API key is missing.');
    }
    this.geminiAi = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  
  async transcribeAudio(audioFileUrl: string): Promise<TranscriptSegment[]> {
    this.logger.log(`Transcribing audio from URL: ${audioFileUrl}`);

    const sttApiUrl = 'https://api.example-stt.com/v1/transcribe';
    const apiKey = this.config.get<string>('STT_API_KEY');

    try {
      const response = await axios.post(
        sttApiUrl,
        {
          audio_url: audioFileUrl,
          diarization: true, 
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Assuming the API returns data in the TranscriptSegment[] format
      return response.data.segments;
    } catch (error) {
      this.logger.error('Error calling STT API:', error.message);
      throw new Error('Failed to transcribe audio.');
    }
  }

  async analyzeTranscript(
    callId: string,
    segments: TranscriptSegment[],
  ): Promise<AnalysisResult> {
    this.logger.log(`Analyzing transcript for call: ${callId}`);

    const criteria = await this.prisma.criteria.findMany();
    const settings = await this.prisma.setting.findFirst();
    const maxScore = settings?.scoringMode === 'HUNDRED' ? 100 : 10;

    const fullTranscript = segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');

    const prompt = this.buildAnalysisPrompt(fullTranscript, criteria, maxScore);

    // Using Gemini API for LLM/Analysis
    try {
      const geminiResponse = await this.geminiAi.models.generateContent({
        model: "gemini-2.5-flash", // Or configurable model
        contents: prompt, // The prompt is already built
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking for faster responses
          },
        },
      });

      // Assuming Gemini returns a text response that needs to be parsed into AnalysisResult
      const analysisText = geminiResponse.text;
      if (!analysisText) {
        throw new Error('Gemini API did not return any text for analysis.');
      }
      // You might need a more robust JSON parsing here, potentially with retries or schema validation
      const analysis: AnalysisResult = JSON.parse(analysisText);

      this.logger.log(`Analysis complete for call ${callId}: score ${analysis.overallScore}`);
      return analysis;
    } catch (error) {
      this.logger.error('Error calling Gemini API for analysis:', error);
      throw new Error('Failed to analyze transcript with Gemini API.');
    }
  }

  
  private buildAnalysisPrompt(transcript: string, criteria: any[], maxScore: number): string {
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

      // Step 1: Transcribe audio
      const segments = await this.transcribeAudio(call.fileUrl);
      const fullTranscript = segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');

      // Save transcript segments
      await this.prisma.transcriptSegment.createMany({
        data: segments.map(seg => ({
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
          durationSec: Math.floor(segments[segments.length - 1]?.endMs / 1000) || 0,
        },
      });

      // Step 2: Analyze transcript
      const analysis = await this.analyzeTranscript(callId, segments);

      // Save analysis results
      await this.prisma.call.update({
        where: { id: callId },
        data: { analysis: analysis as any },
      });

      // Save scores
      await this.prisma.callScore.createMany({
        data: analysis.criteriaScores.map(cs => ({
          callId,
          criteriaId: cs.criteriaId,
          score: cs.score,
          notes: cs.notes,
        })),
      });

      // Save violations
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

      // Update status to DONE
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'DONE' },
      });

      this.logger.log(`Call ${callId} processed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process call ${callId}: ${error.message}`);
      
      // Update status to ERROR
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'ERROR' },
      });

      throw error;
    }
  }

  async generateContent(contents: string, model: string = 'gemini-2.5-flash'): Promise<string> {
    try {
      const response = await this.geminiAi.models.generateContent({
        model: model,
        contents: contents,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking for faster responses
          },
        },
      });
      if (!response.text) {
        throw new Error('Gemini API did not return any text.');
      }
      return response.text;
    } catch (error) {
      this.logger.error('Error generating content with Gemini API:', error);
      throw new Error('Failed to generate content with Gemini API.');
    }
  }
}
