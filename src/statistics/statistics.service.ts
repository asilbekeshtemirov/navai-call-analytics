import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Cron } from '@nestjs/schedule';

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
      const statsByExtCode = new Map<string, {
        callsCount: number;
        totalDuration: number;
        totalScore: number;
        scoreCount: number;
      }>();

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
        const averageScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

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
          `Daily stats for ${extCode}: ${stats.callsCount} calls, ${Math.round(stats.totalDuration / 60)} minutes, avg score: ${averageScore?.toFixed(2) || 'N/A'}`
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
    const monthlyStatsByExtCode = new Map<string, {
      callsCount: number;
      totalDuration: number;
      totalScore: number;
      scoreCount: number;
    }>();

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
      const averageScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : null;

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
}
