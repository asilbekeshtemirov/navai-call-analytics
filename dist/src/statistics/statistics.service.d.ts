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
    getMonthlyStats(year: number, month: number, extCode?: string): Promise<any>;
    getUnifiedStatistics(filters: UnifiedStatisticsDto): Promise<any>;
    private getFilteredDailyStats;
    private getFilteredMonthlyStats;
    private getFilteredSummary;
}
