import { Controller, Post, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SipuniService } from './sipuni.service.js';

@ApiTags('sipuni')
@Controller('sipuni')
export class SipuniController {
  private readonly logger = new Logger(SipuniController.name);

  constructor(private readonly sipuniService: SipuniService) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test Sipuni API connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    try {
      this.logger.log('[CONTROLLER] Testing Sipuni API connection');

      const result = await this.sipuniService.testConnection();

      return {
        success: true,
        message: 'Sipuni service is initialized and ready',
        config: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`[CONTROLLER] Connection test failed: ${error.message}`);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('sync-and-process')
  @ApiOperation({ summary: 'Sipuni ma\'lumotlarini yuklab olib tahlil qilish (STT + AI)' })
  @ApiResponse({ status: 200, description: 'Sync and process completed' })
  async syncAndProcess(
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(`[CONTROLLER] Sync and process request: limit=${limit}`);

      const recordLimit = limit ? parseInt(limit) : 500;
      const result = await this.sipuniService.syncAndProcessRecordings(recordLimit);

      return result;
    } catch (error) {
      this.logger.error(`[CONTROLLER] Sync and process failed: ${error.message}`);
      return {
        success: false,
        message: `Sync and process failed: ${error.message}`,
        recordsProcessed: 0,
      };
    }
  }
}
