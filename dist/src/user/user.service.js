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
    async getUserDailyStats(userId, dateStr) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const date = new Date(dateStr);
        return this.statisticsService.getDailyStats(date, user.extCode || undefined);
    }
    async getUserMonthlyStats(userId, year, month) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return this.statisticsService.getMonthlyStats(year, month, user.extCode || undefined);
    }
    async getUserStatsSummary(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const [dailyStats, monthlyStats] = await Promise.all([
            this.statisticsService.getDailyStats(yesterday, user.extCode || undefined),
            this.statisticsService.getMonthlyStats(currentYear, currentMonth, user.extCode || undefined),
        ]);
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                extCode: user.extCode,
                role: user.role,
            },
            statistics: {
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
            }
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