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
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getStats(filters) {
        return this.dashboardService.getStats(filters);
    }
    getCallsOverTime(filters) {
        return this.dashboardService.getCallsOverTime(filters);
    }
    getTopPerformers(filters, limit) {
        return this.dashboardService.getTopPerformers(filters, limit ? +limit : 10);
    }
    getViolationStats(filters) {
        return this.dashboardService.getViolationStats(filters);
    }
    getAnalysisStats(filters) {
        return this.dashboardService.getAnalysisStats(filters);
    }
};
__decorate([
    Get('stats'),
    ApiOperation({ summary: 'Get dashboard statistics' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardFilterDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getStats", null);
__decorate([
    Get('calls-over-time'),
    ApiOperation({ summary: 'Get calls count over time' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardFilterDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getCallsOverTime", null);
__decorate([
    Get('top-performers'),
    ApiOperation({ summary: 'Get top performing employees' }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    __param(0, Query()),
    __param(1, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardFilterDto, Number]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getTopPerformers", null);
__decorate([
    Get('violations'),
    ApiOperation({ summary: 'Get violation statistics' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardFilterDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getViolationStats", null);
__decorate([
    Get('analysis-stats'),
    ApiOperation({ summary: 'Get AI analysis statistics' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardFilterDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getAnalysisStats", null);
DashboardController = __decorate([
    ApiTags('dashboard'),
    Controller('dashboard'),
    __metadata("design:paramtypes", [DashboardService])
], DashboardController);
export { DashboardController };
//# sourceMappingURL=dashboard.controller.js.map