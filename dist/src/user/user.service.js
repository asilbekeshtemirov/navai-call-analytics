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
import * as bcrypt from 'bcrypt';
import { StatisticsService } from '../statistics/statistics.service.js';
import { UserStatisticsType } from './dto/unified-user-statistics.dto.js';
let UserService = class UserService {
    prisma;
    statisticsService;
    constructor(prisma, statisticsService) {
        this.prisma = prisma;
        this.statisticsService = statisticsService;
    }
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const { password, ...rest } = createUserDto;
        return this.prisma.user.create({
            data: {
                ...rest,
                passwordHash: hashedPassword,
            },
        });
    }
    findAll() {
        return this.prisma.user.findMany();
    }
    findOne(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }
    findOneById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async update(id, updateUserDto) {
        const { password, ...rest } = updateUserDto;
        const data = { ...rest };
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async updateUserRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
    async getUnifiedUserStatistics(userId, filters) {
        const { type, dateFrom, dateTo } = filters;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const result = {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                extCode: user.extCode,
                role: user.role,
            },
            filters: {
                type: type || UserStatisticsType.ALL,
                dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
                dateTo: dateTo ? new Date(dateTo).toISOString() : null,
            },
            data: {}
        };
        try {
            if (type === UserStatisticsType.ALL || type === UserStatisticsType.DAILY) {
                result.data.daily = await this.getFilteredUserDailyStats(user.extCode, filters);
            }
            if (type === UserStatisticsType.ALL || type === UserStatisticsType.MONTHLY) {
                result.data.monthly = await this.getFilteredUserMonthlyStats(user.extCode, filters);
            }
            if (type === UserStatisticsType.ALL || type === UserStatisticsType.SUMMARY) {
                result.data.summary = await this.getFilteredUserSummary(user.extCode, filters);
            }
            return result;
        }
        catch (error) {
            throw new Error(`Unified user statistics error: ${error.message}`);
        }
    }
    async getFilteredUserDailyStats(extCode, filters) {
        const { dateFrom, dateTo } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const currentDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            while (currentDate <= endDate) {
                const dailyStat = await this.statisticsService.getDailyStats(new Date(currentDate), extCode || undefined);
                stats.push({
                    date: currentDate.toISOString().split('T')[0],
                    stats: dailyStat
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return stats;
        }
        else if (dateFrom) {
            return await this.statisticsService.getDailyStats(new Date(dateFrom), extCode || undefined);
        }
        else {
            return await this.statisticsService.getDailyStats(new Date(), extCode || undefined);
        }
    }
    async getFilteredUserMonthlyStats(extCode, filters) {
        const { dateFrom, dateTo } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth() + 1;
            while (currentYear < endDate.getFullYear() ||
                (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth() + 1)) {
                const monthlyStat = await this.statisticsService.getMonthlyStats(currentYear, currentMonth, extCode || undefined);
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
            return await this.statisticsService.getMonthlyStats(now.getFullYear(), now.getMonth() + 1, extCode || undefined);
        }
    }
    async getFilteredUserSummary(extCode, filters) {
        const { dateFrom, dateTo } = filters;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const startDate = dateFrom ? new Date(dateFrom) : yesterday;
        const endDate = dateTo ? new Date(dateTo) : today;
        const [dailyStats, monthlyStats] = await Promise.all([
            this.statisticsService.getDailyStats(startDate, extCode || undefined),
            this.statisticsService.getMonthlyStats(currentYear, currentMonth, extCode || undefined),
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
UserService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        StatisticsService])
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map