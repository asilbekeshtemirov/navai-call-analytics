import { Controller, Post, Get, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SipuniService } from './sipuni.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('sipuni')
@Controller('sipuni')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SipuniController {
  private readonly logger = new Logger(SipuniController.name);

  constructor(private readonly sipuniService: SipuniService) {}

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
  })
  @ApiResponse({ status: 200, description: 'Sync and process completed' })
  async syncAndProcess(
    @OrganizationId() organizationId: number,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(`[CONTROLLER] Sync and process request for org ${organizationId}: limit=${limit}`);

      const recordLimit = limit ? parseInt(limit) : 500;
      const result =
        await this.sipuniService.syncAndProcessRecordings(organizationId, recordLimit);

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
