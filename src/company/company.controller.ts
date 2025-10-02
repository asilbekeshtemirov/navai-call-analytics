import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';

@ApiTags('company')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('statistics/overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Company umumiy statistika' })
  async getCompanyOverview() {
    return this.companyService.getCompanyOverview();
  }

  @Get('statistics/daily')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Company kunlik statistika' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  async getCompanyDailyStats(@Query('date') dateStr?: string) {
    return this.companyService.getCompanyDailyStats(dateStr);
  }

  @Get('statistics/monthly')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Company oylik statistika' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  async getCompanyMonthlyStats(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.companyService.getCompanyMonthlyStats(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Get('employees/performance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Barcha xodimlar performance' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  async getEmployeesPerformance(@Query('period') period: string = 'today') {
    return this.companyService.getEmployeesPerformance(period);
  }

  @Get('calls/recent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'So\'nggi qo\'ng\'iroqlar' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentCalls(@Query('limit') limit?: string) {
    return this.companyService.getRecentCalls(limit ? parseInt(limit) : 50);
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Dashboard uchun barcha ma\'lumotlar' })
  async getDashboardData() {
    return this.companyService.getDashboardData();
  }
}
