var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async getEmployeesPerformance(organizationId, period = 'today') {
        return this.companyService.getEmployeesPerformance(organizationId, period);
    }
    async getRecentCalls(organizationId, limit) {
        return this.companyService.getRecentCalls(organizationId, limit ? parseInt(limit) : 50);
    }
    async getUnifiedStatistics(organizationId, filters) {
        return this.companyService.getUnifiedStatistics(organizationId, filters);
    }
    async exportEmployeesExcel(organizationId, res, period = 'today', dateFrom, dateTo) {
        const buffer = await this.companyService.exportEmployeesExcel(organizationId, period, dateFrom, dateTo);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=xodimlar_statistikasi_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    }
};
__decorate([
    Get('employees/performance'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({ summary: 'Barcha xodimlar performance' }),
    ApiQuery({
        name: 'period',
        required: false,
        enum: ['today', 'week', 'month'],
    }),
    __param(0, OrganizationId()),
    __param(1, Query('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getEmployeesPerformance", null);
__decorate([
    Get('calls/recent'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({ summary: "So'nggi qo'ng'iroqlar" }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    __param(0, OrganizationId()),
    __param(1, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRecentCalls", null);
__decorate([
    Get('statistics'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
        description: "Bu endpoint orqali overview, daily, monthly, dashboard ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
    }),
    __param(0, OrganizationId()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UnifiedStatisticsDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getUnifiedStatistics", null);
__decorate([
    Get('employees/export/excel'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({ summary: "Barcha xodimlar statistikasini Excel formatida yuklab olish" }),
    ApiQuery({
        name: 'period',
        required: false,
        enum: ['today', 'week', 'month'],
    }),
    ApiQuery({
        name: 'dateFrom',
        required: false,
        type: String,
        description: 'YYYY-MM-DD formatida boshlanish sanasi',
    }),
    ApiQuery({
        name: 'dateTo',
        required: false,
        type: String,
        description: 'YYYY-MM-DD formatida tugash sanasi',
    }),
    __param(0, OrganizationId()),
    __param(1, Res()),
    __param(2, Query('period')),
    __param(3, Query('dateFrom')),
    __param(4, Query('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "exportEmployeesExcel", null);
CompanyController = __decorate([
    ApiTags('company'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('company'),
    __metadata("design:paramtypes", [CompanyService])
], CompanyController);
export { CompanyController };
//# sourceMappingURL=company.controller.js.map