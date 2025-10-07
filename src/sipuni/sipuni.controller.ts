import { Controller, Post, Get, Query, Logger, UseGuards, Headers, UnauthorizedException, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SipuniService } from './sipuni.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { OrganizationId } from '../auth/organization-id.decorator.js';
import { ConfigService } from '@nestjs/config';

@ApiTags('sipuni')
@Controller('sipuni')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SipuniController {
  private readonly logger = new Logger(SipuniController.name);

  constructor(
    private readonly sipuniService: SipuniService,
    private readonly config: ConfigService,
  ) {}

  @Get('test-connection')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test Sipuni API connection (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(@OrganizationId() organizationId: number) {
    try {
      this.logger.log(`[CONTROLLER] Testing Sipuni API connection for org ${organizationId}`);

      const result = await this.sipuniService.testConnection(organizationId);

      return {
        success: true,
        message: 'Sipuni service is initialized and ready',
        config: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `[CONTROLLER] Connection test failed: ${error.message}`,
      );
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('sync-and-process')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Sipuni ma'lumotlarini yuklab olib tahlil qilish (STT + AI) - ADMIN only",
    description: "from va to parametrlari: DD.MM.YYYY formatida (masalan: 01.10.2025)",
  })
  @ApiResponse({ status: 200, description: 'Sync and process completed' })
  async syncAndProcess(
    @OrganizationId() organizationId: number,
    @Query('limit') limit?: string,
    @Query('from') from?: string,  // DD.MM.YYYY format
    @Query('to') to?: string,      // DD.MM.YYYY format
  ) {
    try {
      this.logger.log(`[CONTROLLER] Sync and process request for org ${organizationId}: limit=${limit}, from=${from}, to=${to}`);

      const recordLimit = limit ? parseInt(limit) : 500;
      const result = await this.sipuniService.syncAndProcessRecordings(
        organizationId,
        recordLimit,
        from,
        to,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[CONTROLLER] Sync and process failed: ${error.message}`,
      );
      return {
        success: false,
        message: `Sync and process failed: ${error.message}`,
        recordsProcessed: 0,
      };
    }
  }
}

@ApiTags('sipuni-webhook')
@Controller('sipuni-integration')
export class SipuniWebhookController {
  private readonly logger = new Logger(SipuniWebhookController.name);

  constructor(
    private readonly sipuniService: SipuniService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Webhook endpoint for Sipuni integration',
    description: 'Public endpoint protected by API key. Requires X-API-Key header.'
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API Key for authentication',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Sync started successfully' })
  @ApiResponse({ status: 401, description: 'Invalid API Key' })
  async handleWebhook(
    @Headers('x-api-key') apiKey: string,
    @Body() body: { organizationId?: number; limit?: number; from?: string; to?: string },
  ) {
    // Validate API key
    const validApiKey = this.config.get<string>('SIPUNI_WEBHOOK_API_KEY') || 'default-secret-key';

    if (!apiKey || apiKey !== validApiKey) {
      this.logger.warn('[WEBHOOK] Invalid API key attempt');
      throw new UnauthorizedException('Invalid API Key');
    }

    const organizationId = body.organizationId || 1;
    const limit = body.limit || 500;
    const from = body.from;
    const to = body.to;

    try {
      this.logger.log(`[WEBHOOK] Sync request received for org ${organizationId}: limit=${limit}, from=${from}, to=${to}`);

      const result = await this.sipuniService.syncAndProcessRecordings(
        organizationId,
        limit,
        from,
        to,
      );

      return {
        success: true,
        message: 'Sync started successfully',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`[WEBHOOK] Sync failed: ${error.message}`);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
