import { AiService } from './ai/ai.service.js';
export declare class AppService {
    private readonly aiService;
    constructor(aiService: AiService);
    getHello(): string;
    getLlmResponse(prompt: string): Promise<string>;
}
