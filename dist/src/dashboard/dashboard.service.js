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
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(filters) {
        const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (departmentId)
            where.departmentId = departmentId;
        if (employeeId)
            where.employeeId = employeeId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const totalCalls = await this.prisma.call.count({ where });
        const callsWithDuration = await this.prisma.call.findMany({
            where,
            select: { durationSec: true },
        });
        const totalDuration = callsWithDuration.reduce((sum, c) => sum + (c.durationSec || 0), 0);
        const departments = await this.prisma.call.findMany({
            where,
            select: { departmentId: true },
            distinct: ['departmentId'],
        });
        const totalDepartments = departments.filter((d) => d.departmentId).length;
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
    async getCallsOverTime(filters) {
        const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (departmentId)
            where.departmentId = departmentId;
        if (employeeId)
            where.employeeId = employeeId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const calls = await this.prisma.call.findMany({
            where,
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const grouped = calls.reduce((acc, call) => {
            const date = call.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    }
    async getTopPerformers(filters, limit = 10) {
        const { branchId, departmentId, dateFrom, dateTo } = filters;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (departmentId)
            where.departmentId = departmentId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const calls = await this.prisma.call.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
                scores: true,
            },
        });
        const employeeScores = calls.reduce((acc, call) => {
            const empId = call.employeeId;
            if (!acc[empId]) {
                acc[empId] = {
                    employee: call.employee,
                    totalScore: 0,
                    count: 0,
                };
            }
            const avgCallScore = call.scores.length > 0
                ? call.scores.reduce((sum, s) => sum + s.score, 0) / call.scores.length
                : 0;
            acc[empId].totalScore += avgCallScore;
            acc[empId].count += 1;
            return acc;
        }, {});
        const performers = Object.values(employeeScores)
            .map((emp) => ({
            employeeId: emp.employee.id,
            employeeName: `${emp.employee.firstName} ${emp.employee.lastName}`,
            avgScore: emp.totalScore / emp.count,
            callCount: emp.count,
        }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, limit);
        return performers;
    }
    async getViolationStats(filters) {
        const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;
        const callWhere = {};
        if (branchId)
            callWhere.branchId = branchId;
        if (departmentId)
            callWhere.departmentId = departmentId;
        if (employeeId)
            callWhere.employeeId = employeeId;
        if (dateFrom || dateTo) {
            callWhere.createdAt = {};
            if (dateFrom)
                callWhere.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                callWhere.createdAt.lte = new Date(dateTo);
        }
        const calls = await this.prisma.call.findMany({
            where: callWhere,
            select: { id: true },
        });
        const callIds = calls.map((c) => c.id);
        const violations = await this.prisma.violation.findMany({
            where: { callId: { in: callIds } },
        });
        const grouped = violations.reduce((acc, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
    }
    async getAnalysisStats(filters) {
        const { branchId, departmentId, employeeId, dateFrom, dateTo } = filters;
        const where = {
            analysis: { not: null },
        };
        if (branchId)
            where.branchId = branchId;
        if (departmentId)
            where.departmentId = departmentId;
        if (employeeId)
            where.employeeId = employeeId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
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
        const criteriaScores = {};
        for (const call of calls) {
            const analysis = call.analysis;
            if (!analysis)
                continue;
            totalOverallScore += analysis.overallScore || 0;
            for (const critScore of analysis.criteriaScores || []) {
                if (!criteriaScores[critScore.criteriaId]) {
                    const criteria = await this.prisma.criteria.findUnique({ where: { id: critScore.criteriaId } });
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
};
DashboardService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], DashboardService);
export { DashboardService };
//# sourceMappingURL=dashboard.service.js.map