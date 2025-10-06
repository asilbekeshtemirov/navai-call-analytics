import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/public.decorator.js';
import { AiService } from './ai/ai.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AiService,
  ) {}

  @Public()
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

  @Public()
  @Get('process-all-calls')
  async processAllCalls(): Promise<{ message: string }> {
    await this.aiService.processAllUploadedCalls();
    return { message: 'All uploaded calls processing started' };
  }

  @Public()
  @Get('reprocess-error-calls')
  async reprocessErrorCalls(): Promise<{ message: string }> {
    // Reset ERROR calls to UPLOADED status and reprocess them
    const errorCalls = await this.aiService['prisma'].call.findMany({
      where: { status: 'ERROR' },
    });

    for (const call of errorCalls) {
      await this.aiService['prisma'].call.update({
        where: { id: call.id },
        data: { status: 'UPLOADED' },
      });
    }

    await this.aiService.processAllUploadedCalls();
    return {
      message: `Reset ${errorCalls.length} error calls and started reprocessing`,
    };
  }

  @Public()
  @Get('reset-stuck-calls')
  async resetStuckCalls(): Promise<{ message: string }> {
    // Reset PROCESSING calls that are stuck (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const stuckCalls = await this.aiService['prisma'].call.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: { lt: tenMinutesAgo },
      },
    });

    for (const call of stuckCalls) {
      await this.aiService['prisma'].call.update({
        where: { id: call.id },
        data: { status: 'UPLOADED' },
      });
    }

    return {
      message: `Reset ${stuckCalls.length} stuck calls to UPLOADED status`,
    };
  }
}
