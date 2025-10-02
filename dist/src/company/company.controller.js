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
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async getCompanyOverview() {
        return this.companyService.getCompanyOverview();
    }
    async getCompanyDailyStats(dateStr) {
        return this.companyService.getCompanyDailyStats(dateStr);
    }
    async getCompanyMonthlyStats(year, month) {
        return this.companyService.getCompanyMonthlyStats(year ? parseInt(year) : undefined, month ? parseInt(month) : undefined);
    }
    async getEmployeesPerformance(period = 'today') {
        return this.companyService.getEmployeesPerformance(period);
    }
    async getRecentCalls(limit) {
        return this.companyService.getRecentCalls(limit ? parseInt(limit) : 50);
    }
    async getDashboardData() {
        return this.companyService.getDashboardData();
    }
};
__decorate([
    Get('statistics/overview'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Company umumiy statistika' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyOverview", null);
__decorate([
    Get('statistics/daily'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Company kunlik statistika' }),
    ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' }),
    __param(0, Query('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyDailyStats", null);
__decorate([
    Get('statistics/monthly'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Company oylik statistika' }),
    ApiQuery({ name: 'year', required: false, type: Number }),
    ApiQuery({ name: 'month', required: false, type: Number }),
    __param(0, Query('year')),
    __param(1, Query('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyMonthlyStats", null);
__decorate([
    Get('employees/performance'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Barcha xodimlar performance' }),
    ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] }),
    __param(0, Query('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getEmployeesPerformance", null);
__decorate([
    Get('calls/recent'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'So\'nggi qo\'ng\'iroqlar' }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    __param(0, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRecentCalls", null);
__decorate([
    Get('dashboard'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Dashboard uchun barcha ma\'lumotlar' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getDashboardData", null);
CompanyController = __decorate([
    ApiTags('company'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('company'),
    __metadata("design:paramtypes", [CompanyService])
], CompanyController);
export { CompanyController };
//# sourceMappingURL=company.controller.js.map