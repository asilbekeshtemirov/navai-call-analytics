import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Cron } from '@nestjs/schedule';
import {
  UnifiedStatisticsDto,
  StatisticsType,
} from './dto/unified-statistics.dto.js';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Har kuni 00:30 da kechagi statistikani hisoblash
  @Cron('30 0 * * *')
  async calculateDailyStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    this.logger.log(`Calculating daily stats for ${yesterday.toDateString()}`);

    try {
      // Kechagi barcha qo'ng'iroqlarni olish
      const calls = await this.prisma.call.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
          status: 'DONE',
        },
        include: {
          employee: true,
          scores: {
            include: {
              criteria: true,
            },
          },
        },
      });

      // Organization va ExtCode bo'yicha guruhlash
      const statsByOrgAndExtCode = new Map<
        string,
        {
          organizationId: number;
          callsCount: number;
          totalDuration: number;
          totalScore: number;
          scoreCount: number;
        }
      >();

      for (const call of calls) {
        const extCode = call.employee.extCode || 'unknown';
        const organizationId = call.organizationId;
        const key = `${organizationId}-${extCode}`;

        if (!statsByOrgAndExtCode.has(key)) {
          statsByOrgAndExtCode.set(key, {
            organizationId,
            callsCount: 0,
            totalDuration: 0,
            totalScore: 0,
            scoreCount: 0,
          });
        }

        const stats = statsByOrgAndExtCode.get(key)!;
        stats.callsCount++;
        stats.totalDuration += call.durationSec || 0;

        // Score hisoblash
        if (call.scores && call.scores.length > 0) {
          const totalWeight = call.scores.reduce(
            (sum, s) => sum + s.criteria.weight,
            0,
          );
          const weightedScore = call.scores.reduce(
            (sum, s) => sum + s.score * s.criteria.weight,
            0,
          );
          if (totalWeight > 0) {
            stats.totalScore += weightedScore / totalWeight;
            stats.scoreCount++;
          }
        }
      }

      // Har bir organizationId va extCode uchun daily stats saqlash
      for (const [key, stats] of statsByOrgAndExtCode) {
        const extCode = key.split('-')[1];
        const averageScore =
          stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

        await (this.prisma as any).dailyStats.upsert({
          where: {
            organizationId_date_extCode: {
              organizationId: stats.organizationId,
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
            organizationId: stats.organizationId,
            date: yesterday,
            extCode,
            callsCount: stats.callsCount,
            totalDuration: stats.totalDuration,
            averageScore,
            totalScore: stats.totalScore,
          },
        });

        this.logger.log(
          `Daily stats for org ${stats.organizationId}, ${extCode}: ${stats.callsCount} calls, ${Math.round(stats.totalDuration / 60)} minutes, avg score: ${averageScore?.toFixed(2) || 'N/A'}`,
        );
      }

      // Oylik statistikani yangilash
      await this.updateMonthlyStats(yesterday);
    } catch (error) {
      this.logger.error('Failed to calculate daily stats:', error);
    }
  }

  private async updateMonthlyStats(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Shu oyning barcha kunlik statistikalarini olish
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const dailyStats = await (this.prisma as any).dailyStats.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Organization va ExtCode bo'yicha guruhlash
    const monthlyStatsByOrgAndExtCode = new Map<
      string,
      {
        organizationId: number;
        callsCount: number;
        totalDuration: number;
        totalScore: number;
        scoreCount: number;
      }
    >();

    for (const daily of dailyStats) {
      const extCode = daily.extCode;
      const organizationId = daily.organizationId;
      const key = `${organizationId}-${extCode}`;

      if (!monthlyStatsByOrgAndExtCode.has(key)) {
        monthlyStatsByOrgAndExtCode.set(key, {
          organizationId,
          callsCount: 0,
          totalDuration: 0,
          totalScore: 0,
          scoreCount: 0,
        });
      }

      const stats = monthlyStatsByOrgAndExtCode.get(key)!;
      stats.callsCount += daily.callsCount;
      stats.totalDuration += daily.totalDuration;
      stats.totalScore += daily.totalScore;
      if (daily.averageScore !== null) {
        stats.scoreCount += daily.callsCount; // Weighted average
      }
    }

    // Har bir organizationId va extCode uchun monthly stats saqlash
    for (const [key, stats] of monthlyStatsByOrgAndExtCode) {
      const extCode = key.split('-')[1];
      const averageScore =
        stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

      await (this.prisma as any).monthlyStats.upsert({
        where: {
          organizationId_year_month_extCode: {
            organizationId: stats.organizationId,
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
          organizationId: stats.organizationId,
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

  // Manual statistika hisoblash
  async calculateStatsForDate(date: Date) {
    this.logger.log(`Manually calculating stats for ${date.toDateString()}`);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Bu metodda yuqoridagi logikani takrorlash
    // Faqat berilgan sana uchun
  }

  // Kunlik statistikani olish
  async getDailyStats(date: Date, extCode?: string) {
    const where: any = { date };
    if (extCode) {
      where.extCode = extCode;
    }

    return (this.prisma as any).dailyStats.findMany({
      where,
      orderBy: { extCode: 'asc' },
    });
  }

  // Kunlik statistikani olish (organizationId bilan)
  private async getDailyStatsFiltered(
    organizationId: number,
    date: Date,
    extCode?: string,
  ) {
    const where: any = { organizationId, date };
    if (extCode) {
      where.extCode = extCode;
    }

    return (this.prisma as any).dailyStats.findMany({
      where,
      orderBy: { extCode: 'asc' },
    });
  }

  // Oylik statistikani olish
  async getMonthlyStats(year: number, month: number, extCode?: string) {
    const where: any = { year, month };
    if (extCode) {
      where.extCode = extCode;
    }

    return (this.prisma as any).monthlyStats.findMany({
      where,
      orderBy: { extCode: 'asc' },
    });
  }

  // Oylik statistikani olish (organizationId bilan)
  private async getMonthlyStatsFiltered(
    organizationId: number,
    year: number,
    month: number,
    extCode?: string,
  ) {
    const where: any = { organizationId, year, month };
    if (extCode) {
      where.extCode = extCode;
    }

    return (this.prisma as any).monthlyStats.findMany({
      where,
      orderBy: { extCode: 'asc' },
    });
  }

  // Birlashtirilgan statistika - barcha endpoint larni bir joyga birlashtiradi
  async getUnifiedStatistics(
    organizationId: number,
    filters: UnifiedStatisticsDto,
  ) {
    const { type, dateFrom, dateTo, extCode } = filters;

    const result: any = {
      filters: {
        type: type || StatisticsType.ALL,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
        dateTo: dateTo ? new Date(dateTo).toISOString() : null,
        extCode: extCode || null,
      },
      data: {},
    };

    try {
      // Agar type ALL yoki DAILY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.DAILY) {
        result.data.daily = await this.getFilteredDailyStats(
          organizationId,
          filters,
        );
      }

      // Agar type ALL yoki MONTHLY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.MONTHLY) {
        result.data.monthly = await this.getFilteredMonthlyStats(
          organizationId,
          filters,
        );
      }

      // Agar type ALL yoki SUMMARY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.SUMMARY) {
        result.data.summary = await this.getFilteredSummary(
          organizationId,
          filters,
        );
      }

      return result;
    } catch (error) {
      throw new Error(`Unified statistics error: ${error.message}`);
    }
  }

  // Filterlangan kunlik statistika
  private async getFilteredDailyStats(
    organizationId: number,
    filters: UnifiedStatisticsDto,
  ) {
    const { dateFrom, dateTo, extCode } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi har bir kun uchun statistika
      const stats = [];
      const currentDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      while (currentDate <= endDate) {
        const dailyStat = await this.getDailyStatsFiltered(
          organizationId,
          new Date(currentDate),
          extCode,
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
      return await this.getDailyStatsFiltered(
        organizationId,
        new Date(dateFrom),
        extCode,
      );
    } else {
      // Bugungi kun
      return await this.getDailyStatsFiltered(organizationId, new Date(), extCode);
    }
  }

  // Filterlangan oylik statistika
  private async getFilteredMonthlyStats(
    organizationId: number,
    filters: UnifiedStatisticsDto,
  ) {
    const { dateFrom, dateTo, extCode } = filters;

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
        const monthlyStat = await this.getMonthlyStatsFiltered(
          organizationId,
          currentYear,
          currentMonth,
          extCode,
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
      return await this.getMonthlyStatsFiltered(
        organizationId,
        now.getFullYear(),
        now.getMonth() + 1,
        extCode,
      );
    }
  }

  // Filterlangan umumiy xulosalar
  private async getFilteredSummary(
    organizationId: number,
    filters: UnifiedStatisticsDto,
  ) {
    const { dateFrom, dateTo, extCode } = filters;

    // Agar sana berilmagan bo'lsa, default summary qaytaramiz
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const startDate = dateFrom ? new Date(dateFrom) : yesterday;
    const endDate = dateTo ? new Date(dateTo) : today;

    const [dailyStats, monthlyStats] = await Promise.all([
      this.getDailyStatsFiltered(organizationId, startDate, extCode),
      this.getMonthlyStatsFiltered(organizationId, currentYear, currentMonth, extCode),
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

  async exportReports(filters: { dateFrom?: string, dateTo?: string, organizationId: number }) {
    const where: any = {
        organizationId: filters.organizationId,
    };
    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const reports = await this.prisma.report.findMany({
        where,
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (reports.length === 0) {
        return 'No reports found for the given criteria.';
    }

    const header = 'ID,User ID,User Name,Date From,Date To,Total Calls,Total Duration,Avg Score,Summary,Created At\n';
    const rows = reports.map(report => {
        return `${report.id},${report.userId},${report.user.firstName} ${report.user.lastName},${report.dateFrom.toISOString()},${report.dateTo.toISOString()},${report.totalCalls},${report.totalDuration},${report.avgScore},"${report.summary}",${report.createdAt.toISOString()}`;
    }).join('\n');

    return header + rows;
  }
}
