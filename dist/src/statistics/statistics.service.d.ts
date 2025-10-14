import { PrismaService } from '../prisma/prisma.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class StatisticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateDailyStats(): Promise<void>;
    private updateMonthlyStats;
    calculateStatsForDate(date: Date): Promise<void>;
    getDailyStats(date: Date, extCode?: string): Promise<any>;
    private getDailyStatsFiltered;
    private calculateDailyStatsFromCalls;
    getMonthlyStats(year: number, month: number, extCode?: string): Promise<any>;
    private getMonthlyStatsFiltered;
    private calculateMonthlyStatsFromCalls;
    getUnifiedStatistics(organizationId: number, filters: UnifiedStatisticsDto): Promise<any>;
    private getFilteredDailyStats;
    private getFilteredMonthlyStats;
    private getFilteredSummary;
    exportReports(filters: {
        dateFrom?: string;
        dateTo?: string;
        organizationId: number;
    }): Promise<string>;
}
