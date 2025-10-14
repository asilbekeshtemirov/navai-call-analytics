import type { Response } from 'express';
import { StatisticsService } from './statistics.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getUnifiedStatistics(organizationId: number, filters: UnifiedStatisticsDto): Promise<any>;
    exportReports(organizationId: number, res: Response, dateFrom?: string, dateTo?: string): Promise<Response<any, Record<string, any>>>;
    calculateStats(body: {
        date: string;
    }): Promise<{
        message: string;
    }>;
}
