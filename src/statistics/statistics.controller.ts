import { Controller, Get, Query, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OrganizationId } from '../auth/organization-id.decorator.js';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';

@ApiTags('statistics')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
    description:
      "Bu endpoint orqali daily, monthly, summary ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
  })
  async getUnifiedStatistics(
    @OrganizationId() organizationId: number,
    @Query() filters: UnifiedStatisticsDto,
  ) {
    return this.statisticsService.getUnifiedStatistics(
      organizationId,
      filters,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export reports to a CSV file' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async exportReports(
    @OrganizationId() organizationId: number,
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const csv = await this.statisticsService.exportReports({
      dateFrom,
      dateTo,
      organizationId,
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('reports.csv');
    return res.send(csv);
  }

  @Post('calculate')
  @ApiOperation({
    summary: 'Manually calculate statistics for a specific date',
  })
  async calculateStats(@Body() body: { date: string }) {
    const date = new Date(body.date);
    await this.statisticsService.calculateStatsForDate(date);
    return { message: 'Statistics calculation started' };
  }
}
