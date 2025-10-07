import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SipuniService } from './sipuni.service.js';
import { SipuniController, SipuniWebhookController } from './sipuni.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [HttpModule, PrismaModule, forwardRef(() => AiModule)],
  controllers: [SipuniController, SipuniWebhookController],
  providers: [SipuniService],
  exports: [SipuniService],
})
export class SipuniModule {}
