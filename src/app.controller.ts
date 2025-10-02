import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('test-llm')
  async testLlm(): Promise<string> {
    const prompt = 'Explain how AI works in a few words';
    return this.appService.getLlmResponse(prompt);
  }
}
