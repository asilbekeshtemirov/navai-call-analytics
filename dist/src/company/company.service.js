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
import { StatisticsService } from '../statistics/statistics.service.js';
import { SipuniService } from '../sipuni/sipuni.service.js';
import { StatisticsType, } from './dto/unified-statistics.dto.js';
import ExcelJS from 'exceljs';
let CompanyService = class CompanyService {
    prisma;
    statisticsService;
    sipuniService;
    constructor(prisma, statisticsService, sipuniService) {
        this.prisma = prisma;
        this.statisticsService = statisticsService;
        this.sipuniService = sipuniService;
    }
    async getEmployeesPerformance(organizationId, period = 'today') {
        let startDate;
        let endDate = new Date();
        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date();
        }
        const employees = await this.prisma.user.findMany({
            where: {
                organizationId,
                role: 'EMPLOYEE',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                extCode: true,
            },
        });
        const performance = await Promise.all(employees.map(async (employee) => {
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
            const totalDuration = calls.reduce((sum, call) => sum + (call.durationSec || 0), 0);
            const avgScore = calls.length > 0
                ? calls.reduce((sum, call) => {
                    const analysis = call.analysis;
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
        }));
        return performance.sort((a, b) => b.stats.totalCalls - a.stats.totalCalls);
    }
    async getRecentCalls(organizationId, limit = 50) {
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
    async getUnifiedStatistics(organizationId, filters) {
        const { type, dateFrom, dateTo, extCode, employeeId, departmentId, branchId, } = filters;
        const startDate = dateFrom ? new Date(dateFrom) : null;
        const endDate = dateTo ? new Date(dateTo) : null;
        const result = {
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
            if (type === StatisticsType.ALL || type === StatisticsType.OVERVIEW) {
                result.data.overview = await this.getFilteredOverview(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.DAILY) {
                result.data.daily = await this.getFilteredDailyStats(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.MONTHLY) {
                result.data.monthly = await this.getFilteredMonthlyStats(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.DASHBOARD) {
                result.data.dashboard = await this.getFilteredDashboardData(filters);
            }
            if (type === StatisticsType.ALL || type === StatisticsType.SIPUNI) {
                result.data.sipuni = await this.getFilteredSipuniStats(organizationId, filters);
            }
            result.data.summary = await this.getFilteredSummary(filters);
            return result;
        }
        catch (error) {
            throw new Error(`Unified statistics error: ${error.message}`);
        }
    }
    async getFilteredOverview(filters) {
        const { dateFrom, dateTo, extCode, employeeId, departmentId, branchId } = filters;
        const whereCondition = { status: 'DONE' };
        if (dateFrom || dateTo) {
            whereCondition.callDate = {};
            if (dateFrom)
                whereCondition.callDate.gte = new Date(dateFrom);
            if (dateTo)
                whereCondition.callDate.lte = new Date(dateTo);
        }
        if (employeeId) {
            whereCondition.employeeId = employeeId;
        }
        else if (extCode || departmentId || branchId) {
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
        const totalDuration = calls.reduce((sum, call) => sum + (call.durationSec || 0), 0);
        const avgScore = calls.length > 0
            ? calls.reduce((sum, call) => {
                const analysis = call.analysis;
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
    async getFilteredDailyStats(filters) {
        const { dateFrom, dateTo, extCode } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const currentDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            while (currentDate <= endDate) {
                let dailyStat = await this.statisticsService.getDailyStats(new Date(currentDate), extCode);
                if (!dailyStat || dailyStat.length === 0) {
                    dailyStat = await this.calculateRealTimeDailyStats(new Date(currentDate), extCode);
                }
                stats.push({
                    date: currentDate.toISOString().split('T')[0],
                    stats: dailyStat,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return stats;
        }
        else if (dateFrom) {
            let dailyStat = await this.statisticsService.getDailyStats(new Date(dateFrom), extCode);
            if (!dailyStat || dailyStat.length === 0) {
                dailyStat = await this.calculateRealTimeDailyStats(new Date(dateFrom), extCode);
            }
            return dailyStat;
        }
        else {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const stats = [];
            const currentDate = new Date(sevenDaysAgo);
            while (currentDate <= today) {
                let dailyStat = await this.statisticsService.getDailyStats(new Date(currentDate), extCode);
                if (!dailyStat || dailyStat.length === 0) {
                    dailyStat = await this.calculateRealTimeDailyStats(new Date(currentDate), extCode);
                }
                stats.push({
                    date: currentDate.toISOString().split('T')[0],
                    stats: dailyStat,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return stats;
        }
    }
    async getFilteredMonthlyStats(filters) {
        const { dateFrom, dateTo, extCode } = filters;
        if (dateFrom && dateTo) {
            const stats = [];
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth() + 1;
            while (currentYear < endDate.getFullYear() ||
                (currentYear === endDate.getFullYear() &&
                    currentMonth <= endDate.getMonth() + 1)) {
                const monthlyStat = await this.statisticsService.getMonthlyStats(currentYear, currentMonth, extCode);
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
        }
        else {
            const now = new Date();
            let monthlyStat = await this.statisticsService.getMonthlyStats(now.getFullYear(), now.getMonth() + 1, extCode);
            if (!monthlyStat || monthlyStat.length === 0) {
                monthlyStat = await this.calculateRealTimeMonthlyStats(now.getFullYear(), now.getMonth() + 1, extCode);
            }
            return monthlyStat;
        }
    }
    async calculateRealTimeDailyStats(date, extCode) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const whereCondition = {
            status: 'DONE',
            callDate: {
                gte: startOfDay,
                lte: endOfDay,
            },
        };
        if (extCode) {
            whereCondition.employee = { extCode };
        }
        const calls = await this.prisma.call.findMany({
            where: whereCondition,
            include: {
                employee: true,
                scores: {
                    include: {
                        criteria: true,
                    },
                },
            },
        });
        const statsByExtCode = new Map();
        for (const call of calls) {
            const empExtCode = call.employee.extCode || 'unknown';
            if (!statsByExtCode.has(empExtCode)) {
                statsByExtCode.set(empExtCode, {
                    extCode: empExtCode,
                    callsCount: 0,
                    totalDuration: 0,
                    totalScore: 0,
                    scoreCount: 0,
                });
            }
            const stats = statsByExtCode.get(empExtCode);
            stats.callsCount++;
            stats.totalDuration += call.durationSec || 0;
            if (call.scores && call.scores.length > 0) {
                const totalWeight = call.scores.reduce((sum, s) => sum + s.criteria.weight, 0);
                const weightedScore = call.scores.reduce((sum, s) => sum + s.score * s.criteria.weight, 0);
                if (totalWeight > 0) {
                    stats.totalScore += weightedScore / totalWeight;
                    stats.scoreCount++;
                }
            }
        }
        return Array.from(statsByExtCode.values()).map((stats) => ({
            extCode: stats.extCode,
            date: startOfDay,
            callsCount: stats.callsCount,
            totalDuration: stats.totalDuration,
            averageScore: stats.scoreCount > 0
                ? Math.round((stats.totalScore / stats.scoreCount) * 100) / 100
                : null,
            totalScore: stats.totalScore,
        }));
    }
    async calculateRealTimeMonthlyStats(year, month, extCode) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const whereCondition = {
            status: 'DONE',
            callDate: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        };
        if (extCode) {
            whereCondition.employee = { extCode };
        }
        const calls = await this.prisma.call.findMany({
            where: whereCondition,
            include: {
                employee: true,
                scores: {
                    include: {
                        criteria: true,
                    },
                },
            },
        });
        const statsByExtCode = new Map();
        for (const call of calls) {
            const empExtCode = call.employee.extCode || 'unknown';
            if (!statsByExtCode.has(empExtCode)) {
                statsByExtCode.set(empExtCode, {
                    extCode: empExtCode,
                    callsCount: 0,
                    totalDuration: 0,
                    totalScore: 0,
                    scoreCount: 0,
                });
            }
            const stats = statsByExtCode.get(empExtCode);
            stats.callsCount++;
            stats.totalDuration += call.durationSec || 0;
            if (call.scores && call.scores.length > 0) {
                const totalWeight = call.scores.reduce((sum, s) => sum + s.criteria.weight, 0);
                const weightedScore = call.scores.reduce((sum, s) => sum + s.score * s.criteria.weight, 0);
                if (totalWeight > 0) {
                    stats.totalScore += weightedScore / totalWeight;
                    stats.scoreCount++;
                }
            }
        }
        return Array.from(statsByExtCode.values()).map((stats) => ({
            extCode: stats.extCode,
            year,
            month,
            callsCount: stats.callsCount,
            totalDuration: stats.totalDuration,
            averageScore: stats.scoreCount > 0
                ? Math.round((stats.totalScore / stats.scoreCount) * 100) / 100
                : null,
            totalScore: stats.totalScore,
        }));
    }
    async getFilteredDashboardData(filters) {
        return await this.getFilteredOverview(filters);
    }
    async getFilteredSipuniStats(organizationId, filters) {
        try {
            const { dateFrom, dateTo } = filters;
            const fromDate = dateFrom
                ? new Date(dateFrom).toLocaleDateString('ru-RU')
                : new Date().toLocaleDateString('ru-RU');
            const toDate = dateTo
                ? new Date(dateTo).toLocaleDateString('ru-RU')
                : new Date().toLocaleDateString('ru-RU');
            const sipuniRecords = await this.sipuniService.fetchCallRecords(organizationId, fromDate, toDate);
            const totalSipuniCalls = sipuniRecords.length;
            const totalSipuniDuration = sipuniRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
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
                    processingRate: totalSipuniCalls > 0
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
        }
        catch (error) {
            return {
                error: `Sipuni statistics error: ${error.message}`,
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
    async getFilteredSummary(filters) {
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
                daysCount: filters.dateFrom && filters.dateTo
                    ? Math.ceil((new Date(filters.dateTo).getTime() -
                        new Date(filters.dateFrom).getTime()) /
                        (1000 * 60 * 60 * 24)) + 1
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
    async exportEmployeesExcel(organizationId, period = 'today', dateFrom, dateTo) {
        let startDate;
        let endDate = new Date();
        if (dateFrom && dateTo) {
            startDate = new Date(dateFrom);
            endDate = new Date(dateTo);
        }
        else {
            switch (period) {
                case 'week':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                default:
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 1);
                    endDate = new Date();
            }
        }
        const employees = await this.prisma.user.findMany({
            where: {
                organizationId,
                role: 'EMPLOYEE',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                extCode: true,
                phone: true,
                department: {
                    select: {
                        name: true,
                        branch: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lastName: 'asc',
            },
        });
        const employeesWithStats = await Promise.all(employees.map(async (employee) => {
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
                include: {
                    scores: {
                        include: {
                            criteria: true,
                        },
                    },
                },
            });
            const totalCalls = calls.length;
            const totalDuration = calls.reduce((sum, call) => sum + (call.durationSec || 0), 0);
            let avgScore = 0;
            if (calls.length > 0) {
                const scores = calls
                    .map((call) => {
                    if (call.scores && call.scores.length > 0) {
                        const totalWeight = call.scores.reduce((sum, s) => sum + s.criteria.weight, 0);
                        const weightedScore = call.scores.reduce((sum, s) => sum + s.score * s.criteria.weight, 0);
                        return totalWeight > 0 ? weightedScore / totalWeight : 0;
                    }
                    return 0;
                })
                    .filter((score) => score > 0);
                avgScore =
                    scores.length > 0
                        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                        : 0;
            }
            const callsWithScores = calls
                .map((call) => {
                if (call.scores && call.scores.length > 0) {
                    const totalWeight = call.scores.reduce((sum, s) => sum + s.criteria.weight, 0);
                    const weightedScore = call.scores.reduce((sum, s) => sum + s.score * s.criteria.weight, 0);
                    return {
                        ...call,
                        calculatedScore: totalWeight > 0 ? weightedScore / totalWeight : 0,
                    };
                }
                return { ...call, calculatedScore: 0 };
            })
                .filter((call) => call.calculatedScore > 0);
            const bestCall = callsWithScores.length > 0
                ? callsWithScores.reduce((max, call) => call.calculatedScore > max.calculatedScore ? call : max)
                : null;
            const worstCall = callsWithScores.length > 0
                ? callsWithScores.reduce((min, call) => call.calculatedScore < min.calculatedScore ? call : min)
                : null;
            return {
                fullName: `${employee.firstName} ${employee.lastName}`,
                extCode: employee.extCode || 'N/A',
                phone: employee.phone || 'N/A',
                department: employee.department?.name || 'N/A',
                branch: employee.department?.branch?.name || 'N/A',
                totalCalls,
                totalDuration,
                avgDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
                avgScore: Math.round(avgScore * 100) / 100,
                bestScore: bestCall
                    ? Math.round(bestCall.calculatedScore * 100) / 100
                    : 0,
                worstScore: worstCall
                    ? Math.round(worstCall.calculatedScore * 100) / 100
                    : 0,
            };
        }));
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Navai Analytics System';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Xodimlar Statistikasi', {
            properties: { defaultRowHeight: 20 },
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });
        worksheet.columns = [
            { header: '№', key: 'index', width: 5 },
            { header: 'Ism va Familiya', key: 'fullName', width: 25 },
            { header: 'Raqam (Ext)', key: 'extCode', width: 12 },
            { header: 'Telefon', key: 'phone', width: 18 },
            { header: 'Bo\'lim', key: 'department', width: 20 },
            { header: 'Filial', key: 'branch', width: 20 },
            { header: "Jami Qo'ng'iroqlar", key: 'totalCalls', width: 18 },
            { header: 'Jami Davomiyligi (s)', key: 'totalDuration', width: 20 },
            { header: "O'rtacha Davomiyligi (s)", key: 'avgDuration', width: 22 },
            { header: "O'rtacha Ball", key: 'avgScore', width: 15 },
            { header: 'Eng Yaxshi Ball', key: 'bestScore', width: 18 },
            { header: 'Eng Yomon Ball', key: 'worstScore', width: 18 },
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        employeesWithStats.forEach((emp, index) => {
            const row = worksheet.addRow({
                index: index + 1,
                fullName: emp.fullName,
                extCode: emp.extCode,
                phone: emp.phone,
                department: emp.department,
                branch: emp.branch,
                totalCalls: emp.totalCalls,
                totalDuration: emp.totalDuration,
                avgDuration: emp.avgDuration,
                avgScore: emp.avgScore,
                bestScore: emp.bestScore,
                worstScore: emp.worstScore,
            });
            row.alignment = { vertical: 'middle', horizontal: 'left' };
            row.getCell('index').alignment = { horizontal: 'center' };
            row.getCell('totalCalls').alignment = { horizontal: 'center' };
            row.getCell('totalDuration').alignment = { horizontal: 'right' };
            row.getCell('avgDuration').alignment = { horizontal: 'right' };
            row.getCell('avgScore').alignment = { horizontal: 'center' };
            row.getCell('bestScore').alignment = { horizontal: 'center' };
            row.getCell('worstScore').alignment = { horizontal: 'center' };
            if (emp.avgScore >= 80) {
                row.getCell('avgScore').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC6EFCE' },
                };
            }
            else if (emp.avgScore >= 60) {
                row.getCell('avgScore').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' },
                };
            }
            else if (emp.avgScore > 0) {
                row.getCell('avgScore').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' },
                };
                row.getCell('avgScore').font = { color: { argb: 'FF9C0006' } };
            }
            if (index % 2 === 0) {
                row.eachCell((cell, colNumber) => {
                    if (colNumber !== 10) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF2F2F2' },
                        };
                    }
                });
            }
        });
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                };
            });
        });
        const summarySheet = workbook.addWorksheet('Umumiy Statistika');
        summarySheet.columns = [
            { header: "Ko'rsatkich", key: 'metric', width: 35 },
            { header: 'Qiymat', key: 'value', width: 20 },
        ];
        const summaryHeaderRow = summarySheet.getRow(1);
        summaryHeaderRow.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11,
        };
        summaryHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' },
        };
        summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
        summaryHeaderRow.height = 25;
        const totalEmployees = employeesWithStats.length;
        const totalCallsAll = employeesWithStats.reduce((sum, emp) => sum + emp.totalCalls, 0);
        const totalDurationAll = employeesWithStats.reduce((sum, emp) => sum + emp.totalDuration, 0);
        const avgScoreAll = totalEmployees > 0
            ? employeesWithStats.reduce((sum, emp) => sum + emp.avgScore, 0) /
                totalEmployees
            : 0;
        const summaryData = [
            { metric: 'Davrı', value: `${startDate.toLocaleDateString('uz-UZ')} - ${endDate.toLocaleDateString('uz-UZ')}` },
            { metric: 'Jami Xodimlar', value: totalEmployees },
            { metric: "Jami Qo'ng'iroqlar", value: totalCallsAll },
            { metric: 'Jami Davomiyligi (soat)', value: Math.round(totalDurationAll / 3600 * 100) / 100 },
            { metric: "O'rtacha Ball (Barcha Xodimlar)", value: Math.round(avgScoreAll * 100) / 100 },
            { metric: "Xodim boshiga O'rtacha Qo'ng'iroqlar", value: totalEmployees > 0 ? Math.round((totalCallsAll / totalEmployees) * 100) / 100 : 0 },
        ];
        summaryData.forEach((data, index) => {
            const row = summarySheet.addRow(data);
            row.alignment = { vertical: 'middle' };
            row.getCell('value').alignment = { horizontal: 'right' };
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                };
            });
            if (index % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' },
                    };
                });
            }
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
CompanyService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        StatisticsService,
        SipuniService])
], CompanyService);
export { CompanyService };
//# sourceMappingURL=company.service.js.map