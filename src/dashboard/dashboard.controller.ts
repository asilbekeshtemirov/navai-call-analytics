import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getStats(filters);
  }

  @Get('calls-over-time')
  @ApiOperation({ summary: 'Get calls count over time' })
  getCallsOverTime(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getCallsOverTime(filters);
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performing employees' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopPerformers(
    @Query() filters: DashboardFilterDto,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getTopPerformers(filters, limit ? +limit : 10);
  }

  @Get('violations')
  @ApiOperation({ summary: 'Get violation statistics' })
  getViolationStats(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getViolationStats(filters);
  }

  @Get('analysis-stats')
  @ApiOperation({ summary: 'Get AI analysis statistics' })
  getAnalysisStats(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getAnalysisStats(filters);
  }
}
