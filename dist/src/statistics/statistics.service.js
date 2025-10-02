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