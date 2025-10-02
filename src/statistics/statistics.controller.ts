import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service.js';

@ApiTags('statistics')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily statistics' })
  @ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'extCode', required: false, description: 'Filter by extension code' })
  async getDailyStats(
    @Query('date') dateStr: string,
    @Query('extCode') extCode?: string,
  ) {
    const date = new Date(dateStr);
    return this.statisticsService.getDailyStats(date, extCode);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly statistics' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'extCode', required: false, description: 'Filter by extension code' })
  async getMonthlyStats(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('extCode') extCode?: string,
  ) {
    return this.statisticsService.getMonthlyStats(parseInt(year), parseInt(month), extCode);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Manually calculate statistics for a specific date' })
  async calculateStats(@Body() body: { date: string }) {
    const date = new Date(body.date);
    await this.statisticsService.calculateStatsForDate(date);
    return { message: 'Statistics calculation started' };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get summary statistics for dashboard' })
  @ApiQuery({ name: 'extCode', required: false })
  async getSummary(@Query('extCode') extCode?: string) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [dailyStats, monthlyStats] = await Promise.all([
      this.statisticsService.getDailyStats(yesterday, extCode),
      this.statisticsService.getMonthlyStats(currentYear, currentMonth, extCode),
    ]);

    return {
      daily: dailyStats,
      monthly: monthlyStats,
      summary: {
        totalCallsToday: dailyStats.reduce((sum: number, stat: any) => sum + stat.callsCount, 0),
        totalDurationToday: dailyStats.reduce((sum: number, stat: any) => sum + stat.totalDuration, 0),
        averageScoreToday: dailyStats.length > 0 
          ? dailyStats.reduce((sum: number, stat: any) => sum + (stat.averageScore || 0), 0) / dailyStats.length 
          : 0,
        totalCallsThisMonth: monthlyStats.reduce((sum: number, stat: any) => sum + stat.callsCount, 0),
        totalDurationThisMonth: monthlyStats.reduce((sum: number, stat: any) => sum + stat.totalDuration, 0),
        averageScoreThisMonth: monthlyStats.length > 0 
          ? monthlyStats.reduce((sum: number, stat: any) => sum + (stat.averageScore || 0), 0) / monthlyStats.length 
          : 0,
      }
    };
  }
}
