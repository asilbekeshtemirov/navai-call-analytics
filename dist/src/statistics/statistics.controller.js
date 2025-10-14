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
import { Controller, Get, Query, Post, Body, Res } from '@nestjs/common';
import { OrganizationId } from '../auth/organization-id.decorator.js';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getUnifiedStatistics(organizationId, filters) {
        return this.statisticsService.getUnifiedStatistics(organizationId, filters);
    }
    async exportReports(organizationId, res, dateFrom, dateTo) {
        const csv = await this.statisticsService.exportReports({
            dateFrom,
            dateTo,
            organizationId,
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('reports.csv');
        return res.send(csv);
    }
    async calculateStats(body) {
        const date = new Date(body.date);
        await this.statisticsService.calculateStatsForDate(date);
        return { message: 'Statistics calculation started' };
    }
};
__decorate([
    Get(),
    ApiOperation({
        summary: 'Birlashtirilgan statistika - barcha statistika turlarini bir joyda olish',
        description: "Bu endpoint orqali daily, monthly, summary ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
    }),
    __param(0, OrganizationId()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UnifiedStatisticsDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getUnifiedStatistics", null);
__decorate([
    Get('export'),
    ApiOperation({ summary: 'Export reports to a CSV file' }),
    ApiQuery({ name: 'dateFrom', required: false }),
    ApiQuery({ name: 'dateTo', required: false }),
    __param(0, OrganizationId()),
    __param(1, Res()),
    __param(2, Query('dateFrom')),
    __param(3, Query('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "exportReports", null);
__decorate([
    Post('calculate'),
    ApiOperation({
        summary: 'Manually calculate statistics for a specific date',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "calculateStats", null);
StatisticsController = __decorate([
    ApiTags('statistics'),
    ApiBearerAuth('access-token'),
    Controller('statistics'),
    __metadata("design:paramtypes", [StatisticsService])
], StatisticsController);
export { StatisticsController };
//# sourceMappingURL=statistics.controller.js.map