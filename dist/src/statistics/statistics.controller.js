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
import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service.js';
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getDailyStats(dateStr, extCode) {
        const date = new Date(dateStr);
        return this.statisticsService.getDailyStats(date, extCode);
    }
    async getMonthlyStats(year, month, extCode) {
        return this.statisticsService.getMonthlyStats(parseInt(year), parseInt(month), extCode);
    }
    async calculateStats(body) {
        const date = new Date(body.date);
        await this.statisticsService.calculateStatsForDate(date);
        return { message: 'Statistics calculation started' };
    }
    async getSummary(extCode) {
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
                totalCallsToday: dailyStats.reduce((sum, stat) => sum + stat.callsCount, 0),
                totalDurationToday: dailyStats.reduce((sum, stat) => sum + stat.totalDuration, 0),
                averageScoreToday: dailyStats.length > 0
                    ? dailyStats.reduce((sum, stat) => sum + (stat.averageScore || 0), 0) / dailyStats.length
                    : 0,
                totalCallsThisMonth: monthlyStats.reduce((sum, stat) => sum + stat.callsCount, 0),
                totalDurationThisMonth: monthlyStats.reduce((sum, stat) => sum + stat.totalDuration, 0),
                averageScoreThisMonth: monthlyStats.length > 0
                    ? monthlyStats.reduce((sum, stat) => sum + (stat.averageScore || 0), 0) / monthlyStats.length
                    : 0,
            }
        };
    }
};
__decorate([
    Get('daily'),
    ApiOperation({ summary: 'Get daily statistics' }),
    ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format' }),
    ApiQuery({ name: 'extCode', required: false, description: 'Filter by extension code' }),
    __param(0, Query('date')),
    __param(1, Query('extCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getDailyStats", null);
__decorate([
    Get('monthly'),
    ApiOperation({ summary: 'Get monthly statistics' }),
    ApiQuery({ name: 'year', required: true, type: Number }),
    ApiQuery({ name: 'month', required: true, type: Number }),
    ApiQuery({ name: 'extCode', required: false, description: 'Filter by extension code' }),
    __param(0, Query('year')),
    __param(1, Query('month')),
    __param(2, Query('extCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getMonthlyStats", null);
__decorate([
    Post('calculate'),
    ApiOperation({ summary: 'Manually calculate statistics for a specific date' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "calculateStats", null);
__decorate([
    Get('summary'),
    ApiOperation({ summary: 'Get summary statistics for dashboard' }),
    ApiQuery({ name: 'extCode', required: false }),
    __param(0, Query('extCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getSummary", null);
StatisticsController = __decorate([
    ApiTags('statistics'),
    ApiBearerAuth('access-token'),
    Controller('statistics'),
    __metadata("design:paramtypes", [StatisticsService])
], StatisticsController);
export { StatisticsController };
//# sourceMappingURL=statistics.controller.js.map