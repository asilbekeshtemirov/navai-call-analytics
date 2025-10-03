var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StatisticsService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Cron } from '@nestjs/schedule';
import { StatisticsType } from './dto/unified-statistics.dto.js';
let StatisticsService = StatisticsService_1 = class StatisticsService {
    prisma;
    logger = new Logger(StatisticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateDailyStats() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date(yesterday);
        today.setDate(today.getDate() + 1);
        this.logger.log(`Calculating daily stats for ${yesterday.toDateString()}`);
        try {
            const calls = await this.prisma.call.findMany({
                where: {
                    createdAt: {
                        gte: yesterday,
                        lt: today,
                    },
                    status: 'DONE',
                },
            });
            const statsByExtCode = new Map();
            for (const call of calls) {
                const extCode = call.extCode || 'unknown';
                if (!statsByExtCode.has(extCode)) {
                    statsByExtCode.set(extCode, {
                        callsCount: 0,
                        totalDuration: 0,
                        totalScore: 0,
                        scoreCount: 0,
                    });
                }
                const stats = statsByExtCode.get(extCode);
                stats.callsCount++;
                stats.totalDuration += call.duration || 0;
            }
            for (const [extCode, stats] of statsByExtCode) {
                const averageScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;
                await this.prisma.dailyStats.upsert({
                    where: {
                        date_extCode: {
                            date: yesterday,
                            extCode,
                        },
                    },
                    update: {
                        callsCount: stats.callsCount,
                        totalDuration: stats.totalDuration,
                        averageScore,
                        totalScore: stats.totalScore,
                    },
                    create: {
                        date: yesterday,
                        extCode,
                        callsCount: stats.callsCount,
                        totalDuration: stats.totalDuration,
                        averageScore,
                        totalScore: stats.totalScore,
                    },
                });
                this.logger.log(`Daily stats for ${extCode}: ${stats.callsCount} calls, ${Math.round(stats.totalDuration / 60)} minutes, avg score: ${averageScore?.toFixed(2) || 'N/A'}`);
            }
            await this.updateMonthlyStats(yesterday);
        }
        catch (error) {
            this.logger.error('Failed to calculate daily stats:', error);
        }
    }
    async updateMonthlyStats(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const dailyStats = await this.prisma.dailyStats.findMany({
            where: {
                date: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
        });
        const monthlyStatsByExtCode = new Map();
        for (const daily of dailyStats) {
            const extCode = daily.extCode;
            if (!monthlyStatsByExtCode.has(extCode)) {
                monthlyStatsByExtCode.set(extCode, {
                    callsCount: 0,
                    totalDuration: 0,
                    totalScore: 0,
                    scoreCount: 0,
                });
            }
            const stats = monthlyStatsByExtCode.get(extCode);
            stats.callsCount += daily.callsCount;
            stats.totalDuration += daily.totalDuration;
            stats.totalScore += daily.totalScore;
            if (daily.averageScore !== null) {
                stats.scoreCount += daily.callsCount;
            }
        }
        for (const [extCode, stats] of monthlyStatsByExtCode) {
            const averageScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;
            await this.prisma.monthlyStats.upsert({
                where: {
                    year_month_extCode: {
                        year,
                        month,
                        extCode,
                    },
                },
                update: {
                    callsCount: stats.callsCount,
                    totalDuration: stats.totalDuration,
                    averageScore,
                    totalScore: stats.totalScore,
                },
                create: {
                    year,
                    month,
                    extCode,
                    callsCount: stats.callsCount,
                    totalDuration: stats.totalDuration,
                    averageScore,
                    totalScore: stats.totalScore,
                },
            });
        }
        this.logger.log(`Updated monthly stats for ${year}-${month}`);
    }
    async calculateStatsForDate(date) {
        this.logger.log(`Manually calculating stats for ${date.toDateString()}`);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
    }
    async getDailyStats(date, extCode) {
        const where = { date };
        if (extCode) {
            where.extCode = extCode;
        }
        return this.prisma.dailyStats.findMany({
            where,
            orderBy: { extCode: 'asc' },
        });
    }
    async getMonthlyStats(year, month, extCode) {
        const where = { year, month };
        if (extCode) {
            where.extCode = extCode;
        }
        return this.prisma.monthlyStats.findMany({
            where,
            orderBy: { extCode: 'asc' },
        });
    }
    async getUnifiedStatistics(filters) {
        const { type, dateFrom, dateTo, extCode } = filters;
        const result = {
            filters: {
                type: type || StatisticsType.ALL,
                dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
                dateTo: dateTo ? new Date(dateTo).toISOString() : null,
                extCode: extCode || null,
            },
            data: {}
        };
        try {
            if (type === StatisticsType.ALL || type === StatisticsType.DAILY) {
                result.data.daily = await this.getFilteredDailyStats(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.MONTHLY) {
                result.data.monthly = await this.getFilteredMonthlyStats(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.SUMMARY) {
                result.data.summary = await this.getFilteredSummary(filters);
            }
            return result;
        }
        catch (error) {
            throw new Error(`Unified statistics error: ${error.message}`);
        }
    }
    async getFilteredDailyStats(filters) {
        const { dateFrom, dateTo, extCode } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const currentDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            while (currentDate <= endDate) {
                const dailyStat = await this.getDailyStats(new Date(currentDate), extCode);
                stats.push({
                    date: currentDate.toISOString().split('T')[0],
                    stats: dailyStat
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return stats;
        }
        else if (dateFrom) {
            return await this.getDailyStats(new Date(dateFrom), extCode);
        }
        else {
            return await this.getDailyStats(new Date(), extCode);
        }
    }
    async getFilteredMonthlyStats(filters) {
        const { dateFrom, dateTo, extCode } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth() + 1;
            while (currentYear < endDate.getFullYear() ||
                (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth() + 1)) {
                const monthlyStat = await this.getMonthlyStats(currentYear, currentMonth, extCode);
                stats.push({
                    year: currentYear,
                    month: currentMonth,
                    stats: monthlyStat
                });
                currentMonth++;
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear++;
                }
            }
            return stats;
        }
        else {
            const now = new Date();
            return await this.getMonthlyStats(now.getFullYear(), now.getMonth() + 1, extCode);
        }
    }
    async getFilteredSummary(filters) {
        const { dateFrom, dateTo, extCode } = filters;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const startDate = dateFrom ? new Date(dateFrom) : yesterday;
        const endDate = dateTo ? new Date(dateTo) : today;
        const [dailyStats, monthlyStats] = await Promise.all([
            this.getDailyStats(startDate, extCode),
            this.getMonthlyStats(currentYear, currentMonth, extCode),
        ]);
        return {
            period: {
                from: startDate.toISOString().split('T')[0],
                to: endDate.toISOString().split('T')[0],
                daysCount: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            },
            totalCallsInPeriod: dailyStats.reduce((sum, stat) => sum + stat.callsCount, 0),
            totalDurationInPeriod: dailyStats.reduce((sum, stat) => sum + stat.totalDuration, 0),
            averageScoreInPeriod: dailyStats.length > 0
                ? dailyStats.reduce((sum, stat) => sum + (stat.averageScore || 0), 0) / dailyStats.length
                : 0,
            totalCallsThisMonth: monthlyStats.reduce((sum, stat) => sum + stat.callsCount, 0),
            totalDurationThisMonth: monthlyStats.reduce((sum, stat) => sum + stat.totalDuration, 0),
            averageScoreThisMonth: monthlyStats.length > 0
                ? monthlyStats.reduce((sum, stat) => sum + (stat.averageScore || 0), 0) / monthlyStats.length
                : 0,
        };
    }
};
__decorate([
    Cron('30 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsService.prototype, "calculateDailyStats", null);
StatisticsService = StatisticsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], StatisticsService);
export { StatisticsService };
//# sourceMappingURL=statistics.service.js.map