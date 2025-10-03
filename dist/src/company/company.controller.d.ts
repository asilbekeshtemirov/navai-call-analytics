import { CompanyService } from './company.service.js';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
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
    getCompanyMonthlyStats(year?: string, month?: string): Promise<any>;
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
    getRecentCalls(limit?: string): Promise<({
        employee: {
            firstName: string;
            lastName: string;
            extCode: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string | null;
        departmentId: string | null;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
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
