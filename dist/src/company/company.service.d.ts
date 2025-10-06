import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';
import { SipuniService } from '../sipuni/sipuni.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class CompanyService {
    private prisma;
    private statisticsService;
    private sipuniService;
    constructor(prisma: PrismaService, statisticsService: StatisticsService, sipuniService: SipuniService);
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
        id: string;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getUnifiedStatistics(filters: UnifiedStatisticsDto): Promise<any>;
    private getFilteredOverview;
    private getFilteredDailyStats;
    private getFilteredMonthlyStats;
    private getFilteredDashboardData;
    private getFilteredSipuniStats;
    private getFilteredSummary;
}
