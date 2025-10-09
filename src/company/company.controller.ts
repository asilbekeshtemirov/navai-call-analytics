import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('company')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('employees/performance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Barcha xodimlar performance' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month'],
  })
  async getEmployeesPerformance(
    @OrganizationId() organizationId: number,
    @Query('period') period: string = 'today',
  ): Promise<any> {
    return this.companyService.getEmployeesPerformance(organizationId, period);
  }

  @Get('calls/recent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  @ApiOperation({ summary: "So'nggi qo'ng'iroqlar" })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentCalls(
    @OrganizationId() organizationId: number,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.companyService.getRecentCalls(organizationId, limit ? parseInt(limit) : 50);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  @ApiOperation({
    summary:
      'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
    description:
      "Bu endpoint orqali overview, daily, monthly, dashboard ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
  })
  async getUnifiedStatistics(
    @OrganizationId() organizationId: number,
    @Query() filters: UnifiedStatisticsDto,
  ): Promise<any> {
    return this.companyService.getUnifiedStatistics(organizationId, filters);
  }
}
