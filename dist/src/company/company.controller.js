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
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async getEmployeesPerformance(period = 'today') {
        return this.companyService.getEmployeesPerformance(period);
    }
    async getRecentCalls(limit) {
        return this.companyService.getRecentCalls(limit ? parseInt(limit) : 50);
    }
    async getUnifiedStatistics(filters) {
        return this.companyService.getUnifiedStatistics(filters);
    }
};
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
    Get('statistics'),
    Roles(UserRole.ADMIN, UserRole.MANAGER),
    ApiOperation({
        summary: 'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
        description: 'Bu endpoint orqali overview, daily, monthly, dashboard ma\'lumotlarini sana oralig\'i bilan filter qilish mumkin'
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UnifiedStatisticsDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getUnifiedStatistics", null);
CompanyController = __decorate([
    ApiTags('company'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('company'),
    __metadata("design:paramtypes", [CompanyService])
], CompanyController);
export { CompanyController };
//# sourceMappingURL=company.controller.js.map