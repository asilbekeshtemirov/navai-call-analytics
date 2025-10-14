import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { StatisticsService } from '../statistics/statistics.service.js';
import {
  UnifiedUserStatisticsDto,
  UserStatisticsType,
} from './dto/unified-user-statistics.dto.js';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private statisticsService: StatisticsService,
  ) {}

  async create(organizationId: number, createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...rest,
        organizationId, // Multi-tenancy
        passwordHash: hashedPassword,
      },
    });
  }

  findAll(
    organizationId?: number,
    filters?: { branchId?: string; departmentId?: string; excludeSuperAdmin?: boolean },
  ) {
    const where: any = {};

    if (organizationId !== undefined) {
      where.organizationId = organizationId;
    }

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    // ADMIN va MANAGER uchun SUPERADMIN'ni ko'rsatmaslik
    if (filters?.excludeSuperAdmin) {
      where.role = {
        not: 'SUPERADMIN',
      };
    }

    return this.prisma.user.findMany({
      where,
      include: {
        branch: true,
        department: true,
      },
    });
  }

  // Find user by phone (returns first match across all organizations - for backward compatibility)
  findOne(phone: string) {
    return this.prisma.user.findFirst({
      where: { phone },
    });
  }

  // Find user by phone within specific organization
  findOneByOrganization(organizationId: number, phone: string) {
    return this.prisma.user.findUnique({
      where: {
        organizationId_phone: {
          organizationId,
          phone,
        },
      },
    });
  }

  findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;
    const data: any = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUserRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // Birlashtirilgan user statistika - barcha endpoint larni bir joyga birlashtiradi
  async getUnifiedUserStatistics(
    userId: string,
    filters: UnifiedUserStatisticsDto,
  ) {
    const { type, dateFrom, dateTo } = filters;

    // Avval user ni topamiz
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const result: any = {
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
      data: {},
    };

    try {
      // Agar type ALL yoki DAILY bo'lsa
      if (
        type === UserStatisticsType.ALL ||
        type === UserStatisticsType.DAILY
      ) {
        result.data.daily = await this.getFilteredUserDailyStats(
          user.extCode,
          filters,
        );
      }

      // Agar type ALL yoki MONTHLY bo'lsa
      if (
        type === UserStatisticsType.ALL ||
        type === UserStatisticsType.MONTHLY
      ) {
        result.data.monthly = await this.getFilteredUserMonthlyStats(
          user.extCode,
          filters,
        );
      }

      // Agar type ALL yoki SUMMARY bo'lsa
      if (
        type === UserStatisticsType.ALL ||
        type === UserStatisticsType.SUMMARY
      ) {
        result.data.summary = await this.getFilteredUserSummary(
          user.extCode,
          filters,
        );
      }

      return result;
    } catch (error) {
      throw new Error(`Unified user statistics error: ${error.message}`);
    }
  }

  // Filterlangan kunlik statistika
  private async getFilteredUserDailyStats(
    extCode: string | null,
    filters: UnifiedUserStatisticsDto,
  ) {
    const { dateFrom, dateTo } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi har bir kun uchun statistika
      const stats = [];
      const currentDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      while (currentDate <= endDate) {
        const dailyStat = await this.statisticsService.getDailyStats(
          new Date(currentDate),
          extCode || undefined,
        );
        stats.push({
          date: currentDate.toISOString().split('T')[0],
          stats: dailyStat,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return stats;
    } else if (dateFrom) {
      // Faqat bitta kun
      return await this.statisticsService.getDailyStats(
        new Date(dateFrom),
        extCode || undefined,
      );
    } else {
      // Bugungi kun
      return await this.statisticsService.getDailyStats(
        new Date(),
        extCode || undefined,
      );
    }
  }

  // Filterlangan oylik statistika
  private async getFilteredUserMonthlyStats(
    extCode: string | null,
    filters: UnifiedUserStatisticsDto,
  ) {
    const { dateFrom, dateTo } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi oylar uchun statistika
      const stats = [];
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      let currentYear = startDate.getFullYear();
      let currentMonth = startDate.getMonth() + 1;

      while (
        currentYear < endDate.getFullYear() ||
        (currentYear === endDate.getFullYear() &&
          currentMonth <= endDate.getMonth() + 1)
      ) {
        const monthlyStat = await this.statisticsService.getMonthlyStats(
          currentYear,
          currentMonth,
          extCode || undefined,
        );
        stats.push({
          year: currentYear,
          month: currentMonth,
          stats: monthlyStat,
        });

        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }

      return stats;
    } else {
      // Joriy oy
      const now = new Date();
      return await this.statisticsService.getMonthlyStats(
        now.getFullYear(),
        now.getMonth() + 1,
        extCode || undefined,
      );
    }
  }

  // Filterlangan umumiy xulosalar
  private async getFilteredUserSummary(
    extCode: string | null,
    filters: UnifiedUserStatisticsDto,
  ) {
    const { dateFrom, dateTo } = filters;

    // Agar sana berilmagan bo'lsa, default summary qaytaramiz
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const startDate = dateFrom ? new Date(dateFrom) : yesterday;
    const endDate = dateTo ? new Date(dateTo) : today;

    const [dailyStats, monthlyStats] = await Promise.all([
      this.statisticsService.getDailyStats(startDate, extCode || undefined),
      this.statisticsService.getMonthlyStats(
        currentYear,
        currentMonth,
        extCode || undefined,
      ),
    ]);

    return {
      period: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        daysCount:
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1,
      },
      totalCallsInPeriod: dailyStats.reduce(
        (sum: number, stat: any) => sum + stat.callsCount,
        0,
      ),
      totalDurationInPeriod: dailyStats.reduce(
        (sum: number, stat: any) => sum + stat.totalDuration,
        0,
      ),
      averageScoreInPeriod:
        dailyStats.length > 0
          ? dailyStats.reduce(
              (sum: number, stat: any) => sum + (stat.averageScore || 0),
              0,
            ) / dailyStats.length
          : 0,
      totalCallsThisMonth: monthlyStats.reduce(
        (sum: number, stat: any) => sum + stat.callsCount,
        0,
      ),
      totalDurationThisMonth: monthlyStats.reduce(
        (sum: number, stat: any) => sum + stat.totalDuration,
        0,
      ),
      averageScoreThisMonth:
        monthlyStats.length > 0
          ? monthlyStats.reduce(
              (sum: number, stat: any) => sum + (stat.averageScore || 0),
              0,
            ) / monthlyStats.length
          : 0,
    };
  }
}
