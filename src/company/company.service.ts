import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';
import { SipuniService } from '../sipuni/sipuni.service.js';
import {
  UnifiedStatisticsDto,
  StatisticsType,
} from './dto/unified-statistics.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private statisticsService: StatisticsService,
    private sipuniService: SipuniService,
  ) {}

  // Barcha xodimlar performance
  async getEmployeesPerformance(organizationId: number, period: string = 'today'): Promise<any> {
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
      where: {
        organizationId,
        role: 'EMPLOYEE'
      },
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
            organizationId,
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
        const avgScore =
          calls.length > 0
            ? calls.reduce((sum, call) => {
                const analysis: any = call.analysis;
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
  async getRecentCalls(organizationId: number, limit: number = 50): Promise<any> {
    return this.prisma.call.findMany({
      where: { organizationId },
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

  // Birlashtirilgan statistika - barcha endpoint larni bir joyga birlashtiradi
  async getUnifiedStatistics(organizationId: number, filters: UnifiedStatisticsDto): Promise<any> {
    const {
      type,
      dateFrom,
      dateTo,
      extCode,
      employeeId,
      departmentId,
      branchId,
    } = filters;

    // Sana oralig'ini aniqlash
    const startDate = dateFrom ? new Date(dateFrom) : null;
    const endDate = dateTo ? new Date(dateTo) : null;

    const result: any = {
      filters: {
        type: type || StatisticsType.ALL,
        dateFrom: startDate?.toISOString(),
        dateTo: endDate?.toISOString(),
        extCode,
        employeeId,
        departmentId,
        branchId,
      },
      data: {},
    };

    try {
      // Agar type ALL yoki OVERVIEW bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.OVERVIEW) {
        result.data.overview = await this.getFilteredOverview(filters);
      }

      // Agar type ALL yoki DAILY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.DAILY) {
        result.data.daily = await this.getFilteredDailyStats(filters);
      }

      // Agar type ALL yoki MONTHLY bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.MONTHLY) {
        result.data.monthly = await this.getFilteredMonthlyStats(filters);
      }

      // Agar type ALL yoki DASHBOARD bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.DASHBOARD) {
        result.data.dashboard = await this.getFilteredDashboardData(filters);
      }

      // Agar type ALL yoki SIPUNI bo'lsa
      if (type === StatisticsType.ALL || type === StatisticsType.SIPUNI) {
        result.data.sipuni = await this.getFilteredSipuniStats(organizationId, filters);
      }

      // Qo'shimcha ma'lumotlar
      result.data.summary = await this.getFilteredSummary(filters);

      return result;
    } catch (error) {
      throw new Error(`Unified statistics error: ${(error as Error).message}`);
    }
  }

  // Filterlangan overview ma'lumotlari
  private async getFilteredOverview(
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    const { dateFrom, dateTo, extCode, employeeId, departmentId, branchId } =
      filters;

    const whereCondition: Prisma.CallWhereInput = { status: 'DONE' };

    // Sana filtri
    if (dateFrom || dateTo) {
      whereCondition.callDate = {};
      if (dateFrom) whereCondition.callDate.gte = new Date(dateFrom);
      if (dateTo) whereCondition.callDate.lte = new Date(dateTo);
    }

    // Employee filtri
    if (employeeId) {
      whereCondition.employeeId = employeeId;
    } else if (extCode || departmentId || branchId) {
      whereCondition.employee = {
        ...(extCode && { extCode }),
        ...(departmentId && { departmentId }),
        ...(branchId && { department: { branchId } }),
      };
    }

    const [totalCalls, totalEmployees] = await Promise.all([
      this.prisma.call.count({ where: whereCondition }),
      this.prisma.user.count({
        where: {
          role: 'EMPLOYEE',
          ...(employeeId && { id: employeeId }),
          ...(extCode && { extCode }),
          ...(departmentId && { departmentId }),
          ...(branchId && { department: { branchId } }),
        },
      }),
    ]);

    const calls = await this.prisma.call.findMany({
      where: whereCondition,
      select: {
        durationSec: true,
        analysis: true,
      },
    });

    const totalDuration = calls.reduce(
      (sum, call) => sum + (call.durationSec || 0),
      0,
    );
    const avgScore =
      calls.length > 0
        ? calls.reduce((sum, call) => {
            const analysis: any = call.analysis;
            return sum + (analysis?.overallScore || 0);
          }, 0) / calls.length
        : 0;

    return {
      totalEmployees,
      totalCalls,
      totalDuration,
      avgScore: Math.round(avgScore * 100) / 100,
      period: {
        from: dateFrom,
        to: dateTo,
      },
    };
  }

  // Filterlangan kunlik statistika
  private async getFilteredDailyStats(
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    const { dateFrom, dateTo, extCode } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi har bir kun uchun statistika
      const stats: any[] = [];
      const currentDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      while (currentDate <= endDate) {
        const dailyStat = await this.statisticsService.getDailyStats(
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
      return await this.statisticsService.getDailyStats(
        new Date(dateFrom),
        extCode,
      );
    } else {
      // Bugungi kun
      return await this.statisticsService.getDailyStats(new Date(), extCode);
    }
  }

  // Filterlangan oylik statistika
  private async getFilteredMonthlyStats(
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    const { dateFrom, dateTo, extCode } = filters;

    if (dateFrom && dateTo) {
      // Sana oralig'idagi oylar uchun statistika
      const stats: any[] = [];
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
      return await this.statisticsService.getMonthlyStats(
        now.getFullYear(),
        now.getMonth() + 1,
        extCode,
      );
    }
  }

  // Filterlangan dashboard ma'lumotlari
  private async getFilteredDashboardData(
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    // Dashboard uchun asosiy ma'lumotlarni qaytarish
    return await this.getFilteredOverview(filters);
  }

  // Filterlangan Sipuni statistikalari
  private async getFilteredSipuniStats(
    organizationId: number,
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    try {
      const { dateFrom, dateTo } = filters;

      // Sana formatini Sipuni API uchun o'zgartirish (dd.mm.yyyy)
      const fromDate = dateFrom
        ? new Date(dateFrom).toLocaleDateString('ru-RU')
        : new Date().toLocaleDateString('ru-RU');

      const toDate = dateTo
        ? new Date(dateTo).toLocaleDateString('ru-RU')
        : new Date().toLocaleDateString('ru-RU');

      // Sipuni dan call records olish
      const sipuniRecords: any[] = await this.sipuniService.fetchCallRecords(
        organizationId,
        fromDate,
        toDate,
      );

      // Sipuni ma'lumotlarini tahlil qilish
      const totalSipuniCalls = sipuniRecords.length;
      const totalSipuniDuration = sipuniRecords.reduce(
        (sum, record) => sum + (record.duration || 0),
        0,
      );

      // Sipuni qo'ng'iroqlarini tizimda mavjud qo'ng'iroqlar bilan solishtirish
      const processedCalls = await this.prisma.call.count({
        where: {
          externalId: {
            in: sipuniRecords.map((r) => r.uid),
          },
          status: 'DONE',
        },
      });

      return {
        sipuniData: {
          totalRecords: totalSipuniCalls,
          totalDuration: totalSipuniDuration,
          recordsWithAudio: sipuniRecords.filter((r) => r.record).length,
          processedInSystem: processedCalls,
          processingRate:
            totalSipuniCalls > 0
              ? Math.round((processedCalls / totalSipuniCalls) * 100)
              : 0,
        },
        recentRecords: sipuniRecords.slice(0, 10).map((record) => ({
          uid: record.uid,
          caller: record.caller,
          client: record.client,
          start: record.start,
          duration: record.duration,
          hasRecording: !!record.record,
          status: record.status,
        })),
        period: {
          from: fromDate,
          to: toDate,
        },
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: `Sipuni statistics error: ${(error as Error).message}`,
        sipuniData: {
          totalRecords: 0,
          totalDuration: 0,
          recordsWithAudio: 0,
          processedInSystem: 0,
          processingRate: 0,
        },
        recentRecords: [],
        period: {
          from: filters.dateFrom,
          to: filters.dateTo,
        },
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Filterlangan umumiy xulosalar
  private async getFilteredSummary(
    filters: UnifiedStatisticsDto,
  ): Promise<any> {
    const overview = await this.getFilteredOverview(filters);

    return {
      totalMetrics: {
        calls: overview.totalCalls,
        employees: overview.totalEmployees,
        duration: overview.totalDuration,
        averageScore: overview.avgScore,
      },
      period: {
        from: filters.dateFrom,
        to: filters.dateTo,
        daysCount:
          filters.dateFrom && filters.dateTo
            ? Math.ceil(
                (new Date(filters.dateTo).getTime() -
                  new Date(filters.dateFrom).getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1
            : 1,
      },
      appliedFilters: {
        extCode: filters.extCode,
        employeeId: filters.employeeId,
        departmentId: filters.departmentId,
        branchId: filters.branchId,
      },
    };
  }
}
