import { Module } from '@nestjs/common';
import { DownloaderService } from './downloader.service.js';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from '../ai/ai.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

import { DownloaderController } from './downloader.controller.js';

@Module({
  imports: [HttpModule, AiModule, PrismaModule],
  providers: [DownloaderService],
  controllers: [DownloaderController],
})
export class DownloaderModule {}
