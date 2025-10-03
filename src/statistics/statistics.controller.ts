import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';

@ApiTags('statistics')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
    description: 'Bu endpoint orqali daily, monthly, summary ma\'lumotlarini sana oralig\'i bilan filter qilish mumkin'
  })
  async getUnifiedStatistics(@Query() filters: UnifiedStatisticsDto) {
    return this.statisticsService.getUnifiedStatistics(filters);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Manually calculate statistics for a specific date' })
  async calculateStats(@Body() body: { date: string }) {
    const date = new Date(body.date);
    await this.statisticsService.calculateStatsForDate(date);
    return { message: 'Statistics calculation started' };
  }

}
