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
        // include: {
        //   callScores: true,
        // },
      });

      // ExtCode bo'yicha guruhlash
      const statsByExtCode = new Map<
        string,
        {
          callsCount: number;
          totalDuration: number;
          totalScore: number;
          scoreCount: number;
        }
      >();

      for (const call of calls) {
        const extCode = (call as any).extCode || 'unknown';

        if (!statsByExtCode.has(extCode)) {
          statsByExtCode.set(extCode, {
            callsCount: 0,
            totalDuration: 0,
            totalScore: 0,
            scoreCount: 0,
          });
        }

        const stats = statsByExtCode.get(extCode)!;
        stats.callsCount++;
        stats.totalDuration += (call as any).duration || 0;

        // Hozircha score hisoblashni o'tkazib yuboramiz
        // Schema yangilanganidan keyin qo'shamiz
      }

      // Har bir extCode uchun daily stats saqlash
      for (const [extCode, stats] of statsByExtCode) {
        const averageScore =
          stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

        await (this.prisma as any).dailyStats.upsert({
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

        this.logger.log(
          `Daily stats for ${extCode}: ${stats.callsCount} calls, ${Math.round(stats.totalDuration / 60)} minutes, avg score: ${averageScore?.toFixed(2) || 'N/A'}`,
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

    // ExtCode bo'yicha guruhlash
    const monthlyStatsByExtCode = new Map<
      string,
      {
        callsCount: number;
        totalDuration: number;
        totalScore: number;
        scoreCount: number;
      }
    >();

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

      const stats = monthlyStatsByExtCode.get(extCode)!;
      stats.callsCount += daily.callsCount;
      stats.totalDuration += daily.totalDuration;
      stats.totalScore += daily.totalScore;
      if (daily.averageScore !== null) {
        stats.scoreCount += daily.callsCount; // Weighted average
      }
    }

    // Har bir extCode uchun monthly stats saqlash
    for (const [extCode, stats] of monthlyStatsByExtCode) {
      const averageScore =
        stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

      await (this.prisma as any).monthlyStats.upsert({
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

  // Birlashtirilgan statistika - barcha endpoint larni bir joyga birlashtiradi
  async getUnifiedStatistics(filters: UnifiedStatisticsDto) {
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
        result.data.daily = await this.getFilteredDailyStats(filters);
      }

      // Agar type ALL yoki MONTHLY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.MONTHLY) {
        result.data.monthly = await this.getFilteredMonthlyStats(filters);
      }

      // Agar type ALL yoki SUMMARY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.SUMMARY) {
        result.data.summary = await this.getFilteredSummary(filters);
      }

      return result;
    } catch (error) {
      throw new Error(`Unified statistics error: ${error.message}`);
    }
  }

  // Filterlangan kunlik statistika
  private async getFilteredDailyStats(filters: UnifiedStatisticsDto) {
    const { dateFrom, dateTo, extCode } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi har bir kun uchun statistika
      const stats = [];
      const currentDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      while (currentDate <= endDate) {
        const dailyStat = await this.getDailyStats(
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
      return await this.getDailyStats(new Date(dateFrom), extCode);
    } else {
      // Bugungi kun
      return await this.getDailyStats(new Date(), extCode);
    }
  }

  // Filterlangan oylik statistika
  private async getFilteredMonthlyStats(filters: UnifiedStatisticsDto) {
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
        const monthlyStat = await this.getMonthlyStats(
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
      return await this.getMonthlyStats(
        now.getFullYear(),
        now.getMonth() + 1,
        extCode,
      );
    }
  }

  // Filterlangan umumiy xulosalar
  private async getFilteredSummary(filters: UnifiedStatisticsDto) {
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
      this.getDailyStats(startDate, extCode),
      this.getMonthlyStats(currentYear, currentMonth, extCode),
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
