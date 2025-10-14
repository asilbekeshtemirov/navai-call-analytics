import { PrismaService } from '../prisma/prisma.service.js';
import { StatisticsService } from '../statistics/statistics.service.js';
import { SipuniService } from '../sipuni/sipuni.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class CompanyService {
    private prisma;
    private statisticsService;
    private sipuniService;
    constructor(prisma: PrismaService, statisticsService: StatisticsService, sipuniService: SipuniService);
    getEmployeesPerformance(organizationId: number, period?: string): Promise<any>;
    getRecentCalls(organizationId: number, limit?: number): Promise<any>;
    getUnifiedStatistics(organizationId: number, filters: UnifiedStatisticsDto): Promise<any>;
    private getFilteredOverview;
    private getFilteredDailyStats;
    private getFilteredMonthlyStats;
    private calculateRealTimeDailyStats;
    private calculateRealTimeMonthlyStats;
    private getFilteredDashboardData;
    private getFilteredSipuniStats;
    private getFilteredSummary;
}
