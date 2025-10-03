import { StatisticsService } from './statistics.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getUnifiedStatistics(filters: UnifiedStatisticsDto): Promise<any>;
    calculateStats(body: {
        date: string;
    }): Promise<{
        message: string;
    }>;
}
