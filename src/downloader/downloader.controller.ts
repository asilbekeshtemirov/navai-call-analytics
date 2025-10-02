import { Controller, Post, UseGuards } from '@nestjs/common';
import { DownloaderService } from './downloader.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('downloader')
@ApiBearerAuth('access-token')
@Controller('downloader')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DownloaderController {
  constructor(private readonly downloaderService: DownloaderService) {}

  @Post('trigger')
  async triggerDownload() {
    this.downloaderService['downloadAndProcessCalls']();
    return { message: 'Download process triggered successfully.' };
  }
}
