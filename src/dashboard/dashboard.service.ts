import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(filters: DashboardFilterDto) {
    const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;

    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;
    if (employeeId) where.employeeId = employeeId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Total calls
    const totalCalls = await this.prisma.call.count({ where });

    // Total duration
    const callsWithDuration = await this.prisma.call.findMany({
      where,
      select: { durationSec: true },
    });
    const totalDuration = callsWithDuration.reduce((sum: number, c: { durationSec: number | null }) => sum + (c.durationSec || 0), 0);

    // Total departments
    const departments = await this.prisma.call.findMany({
      where,
      select: { departmentId: true },
      distinct: ['departmentId'],
    });
    const totalDepartments = departments.filter((d: { departmentId: string | null }) => d.departmentId).length;

    // Total employees
    const employees = await this.prisma.call.findMany({
      where,
      select: { employeeId: true },
      distinct: ['employeeId'],
    });
    const totalEmployees = employees.length;

    return {
      totalCalls,
      totalDuration,
      totalDepartments,
      totalEmployees,
    };
  }

  async getCallsOverTime(filters: DashboardFilterDto) {
    const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;
    if (employeeId) where.employeeId = employeeId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const grouped = calls.reduce((acc: Record<string, number>, call: { createdAt: Date }) => {
      const date = call.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  async getTopPerformers(filters: DashboardFilterDto, limit = 10) {
    const { branchId, departmentId, dateFrom, dateTo } = filters;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        scores: true,
      },
    });

    // Calculate average score per employee
    const employeeScores = calls.reduce((acc: Record<string, any>, call: { employeeId: string; employee: any; scores: any[] }) => {
      const empId = call.employeeId;
      if (!acc[empId]) {
        acc[empId] = {
          employee: call.employee,
          totalScore: 0,
          count: 0,
        };
      }
      const avgCallScore = call.scores.length > 0
        ? call.scores.reduce((sum: number, s: { score: number }) => sum + s.score, 0) / call.scores.length
        : 0;
      acc[empId].totalScore += avgCallScore;
      acc[empId].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const performers = Object.values(employeeScores)
      .map((emp: any) => ({
        employeeId: emp.employee.id,
        employeeName: `${emp.employee.firstName} ${emp.employee.lastName}`,
        avgScore: emp.totalScore / emp.count,
        callCount: emp.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit);

    return performers;
  }

  async getViolationStats(filters: DashboardFilterDto) {
    const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;

    const callWhere: any = {};
    if (branchId) callWhere.branchId = branchId;
    if (departmentId) callWhere.departmentId = departmentId;
    if (employeeId) callWhere.employeeId = employeeId;
    if (dateFrom || dateTo) {
      callWhere.createdAt = {};
      if (dateFrom) callWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) callWhere.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where: callWhere,
      select: { id: true },
    });

    const callIds = calls.map((c: { id: string }) => c.id);

    const violations = await this.prisma.violation.findMany({
      where: { callId: { in: callIds } },
    });

    // Group by type
    const grouped = violations.reduce((acc: Record<string, number>, v: { type: string }) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([type, count]) => ({ type, count }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count);
  }

  async getAnalysisStats(filters: DashboardFilterDto) {
    const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;

    const where: any = {
      analysis: { not: null },
    };

    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;
    if (employeeId) where.employeeId = employeeId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      select: { analysis: true },
    });

    if (calls.length === 0) {
      return {
        avgOverallScore: 0,
        criteriaStats: [],
      };
    }

    let totalOverallScore = 0;
    const criteriaScores: Record<string, { totalScore: number; count: number; name: string }> = {};

    for (const call of calls) {
      const analysis = call.analysis as any;
      if (!analysis) continue;

      totalOverallScore += analysis.overallScore || 0;

      for (const critScore of analysis.criteriaScores || []) {
        if (!criteriaScores[critScore.criteriaId]) {
          const criteria = await this.prisma.criteria.findUnique({ where: { id: critScore.criteriaId }});
          criteriaScores[critScore.criteriaId] = { totalScore: 0, count: 0, name: criteria?.name || 'Unknown Criteria' };
        }
        criteriaScores[critScore.criteriaId].totalScore += critScore.score || 0;
        criteriaScores[critScore.criteriaId].count += 1;
      }
    }

    const avgOverallScore = totalOverallScore / calls.length;

    const criteriaStats = Object.entries(criteriaScores).map(([criteriaId, data]) => ({
      criteriaId,
      name: data.name,
      avgScore: data.totalScore / data.count,
    }));

    return {
      avgOverallScore,
      criteriaStats,
    };
  }
}
