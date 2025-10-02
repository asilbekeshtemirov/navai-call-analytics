import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';
export declare class CompanyService {
    private prisma;
    private statisticsService;
    constructor(prisma: PrismaService, statisticsService: StatisticsService);
    getCompanyOverview(): Promise<{
        totalEmployees: number;
        totalCalls: number;
        todayCalls: number;
        monthCalls: number;
        totalDurationToday: any;
        avgScoreToday: number;
        dailyStats: any;
        monthlyStats: any;
    }>;
    getCompanyDailyStats(dateStr?: string): Promise<any>;
    getCompanyMonthlyStats(year?: number, month?: number): Promise<any>;
    getEmployeesPerformance(period?: string): Promise<{
        employee: {
            id: string;
            name: string;
            extCode: string | null;
        };
        stats: {
            totalCalls: number;
            totalDuration: number;
            avgScore: number;
        };
    }[]>;
    getRecentCalls(limit?: number): Promise<({
        employee: {
            firstName: string;
            lastName: string;
            extCode: string | null;
        };
    } & {
        status: import("@prisma/client").$Enums.CallStatus;
        id: string;
        branchId: string | null;
        departmentId: string | null;
        createdAt: Date;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        fileUrl: string;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getDashboardData(): Promise<{
        totalEmployees: number;
        totalCalls: number;
        todayCalls: number;
        monthCalls: number;
        totalDurationToday: any;
        avgScoreToday: number;
        dailyStats: any;
        monthlyStats: any;
    }>;
}
