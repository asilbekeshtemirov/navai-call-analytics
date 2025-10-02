var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';
let CompanyService = class CompanyService {
    prisma;
    statisticsService;
    constructor(prisma, statisticsService) {
        this.prisma = prisma;
        this.statisticsService = statisticsService;
    }
    async getCompanyOverview() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const [totalEmployees, totalCalls, todayCalls, monthCalls, dailyStats, monthlyStats,] = await Promise.all([
            this.prisma.user.count({ where: { role: 'EMPLOYEE' } }),
            this.prisma.call.count({ where: { status: 'DONE' } }),
            this.prisma.call.count({
                where: {
                    status: 'DONE',
                    callDate: {
                        gte: yesterday,
                        lt: today,
                    },
                },
            }),
            this.prisma.call.count({
                where: {
                    status: 'DONE',
                    callDate: {
                        gte: new Date(currentYear, currentMonth - 1, 1),
                        lt: new Date(currentYear, currentMonth, 1),
                    },
                },
            }),
            this.statisticsService.getDailyStats(yesterday),
            this.statisticsService.getMonthlyStats(currentYear, currentMonth),
        ]);
        const totalDurationToday = dailyStats.reduce((sum, stat) => sum + stat.totalDuration, 0);
        const avgScoreToday = dailyStats.length > 0
            ? dailyStats.reduce((sum, stat) => sum + (stat.averageScore || 0), 0) / dailyStats.length
            : 0;
        return {
            totalEmployees,
            totalCalls,
            todayCalls,
            monthCalls,
            totalDurationToday,
            avgScoreToday: Math.round(avgScoreToday * 100) / 100,
            dailyStats,
            monthlyStats,
        };
    }
    async getCompanyDailyStats(dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.statisticsService.getDailyStats(date);
    }
    async getCompanyMonthlyStats(year, month) {
        const currentDate = new Date();
        const targetYear = year || currentDate.getFullYear();
        const targetMonth = month || currentDate.getMonth() + 1;
        return this.statisticsService.getMonthlyStats(targetYear, targetMonth);
    }
    async getEmployeesPerformance(period = 'today') {
        let startDate;
        let endDate = new Date();
        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date();
        }
        const employees = await this.prisma.user.findMany({
            where: { role: 'EMPLOYEE' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                extCode: true,
            },
        });
        const performance = await Promise.all(employees.map(async (employee) => {
            const calls = await this.prisma.call.findMany({
                where: {
                    employeeId: employee.id,
                    status: 'DONE',
                    callDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
            const totalCalls = calls.length;
            const totalDuration = calls.reduce((sum, call) => sum + (call.durationSec || 0), 0);
            const avgScore = calls.length > 0
                ? calls.reduce((sum, call) => {
                    const analysis = call.analysis;
                    return sum + (analysis?.overallScore || 0);
                }, 0) / calls.length
                : 0;
            return {
                employee: {
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    extCode: employee.extCode,
                },
                stats: {
                    totalCalls,
                    totalDuration,
                    avgScore: Math.round(avgScore * 100) / 100,
                },
            };
        }));
        return performance.sort((a, b) => b.stats.totalCalls - a.stats.totalCalls);
    }
    async getRecentCalls(limit = 50) {
        return this.prisma.call.findMany({
            take: limit,
            orderBy: { callDate: 'desc' },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        extCode: true,
                    },
                },
            },
        });
    }
    async getDashboardData() {
        return this.getCompanyOverview();
    }
};
CompanyService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        StatisticsService])
], CompanyService);
export { CompanyService };
//# sourceMappingURL=company.service.js.map