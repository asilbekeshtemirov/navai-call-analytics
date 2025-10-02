import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private statisticsService: StatisticsService,
  ) {}

  // Company umumiy statistika
  async getCompanyOverview() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [
      totalEmployees,
      totalCalls,
      todayCalls,
      monthCalls,
      dailyStats,
      monthlyStats,
    ] = await Promise.all([
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

    const totalDurationToday = dailyStats.reduce(
      (sum: number, stat: any) => sum + stat.totalDuration,
      0,
    );
    const avgScoreToday =
      dailyStats.length > 0
        ? dailyStats.reduce(
            (sum: number, stat: any) => sum + (stat.averageScore || 0),
            0,
          ) / dailyStats.length
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

  // Company kunlik statistika
  async getCompanyDailyStats(dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.statisticsService.getDailyStats(date);
  }

  // Company oylik statistika
  async getCompanyMonthlyStats(year?: number, month?: number) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;

    return this.statisticsService.getMonthlyStats(targetYear, targetMonth);
  }

  // Barcha xodimlar performance
  async getEmployeesPerformance(period: string = 'today') {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default: // today
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

    const performance = await Promise.all(
      employees.map(async (employee) => {
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
        const totalDuration = calls.reduce(
          (sum, call) => sum + (call.durationSec || 0),
          0,
        );
        const avgScore = calls.length > 0
          ? calls.reduce((sum, call) => {
              const analysis = call.analysis as any;
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
      }),
    );

    return performance.sort((a, b) => b.stats.totalCalls - a.stats.totalCalls);
  }

  // So'nggi qo'ng'iroqlar
  async getRecentCalls(limit: number = 50) {
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
}
