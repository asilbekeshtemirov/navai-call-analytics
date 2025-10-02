import { Injectable } from '@nestjs/common';
import { AiService } from './ai/ai.service.js';

@Injectable()
export class AppService {
  constructor(private readonly aiService: AiService) {}

  getHello(): string {
    return 'Navai Analytics';
  }

  async getLlmResponse(prompt: string): Promise<string> {
    return this.aiService.generateContent(prompt);
  }
}
