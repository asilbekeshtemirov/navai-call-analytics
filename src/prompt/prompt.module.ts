import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service.js';
import { PromptController } from './prompt.controller.js';

@Module({
  controllers: [PromptController],
  providers: [PromptService],
})
export class PromptModule {}
