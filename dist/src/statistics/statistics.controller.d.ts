import { StatisticsService } from './statistics.service.js';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDailyStats(dateStr: string, extCode?: string): Promise<any>;
    getMonthlyStats(year: string, month: string, extCode?: string): Promise<any>;
    calculateStats(body: {
        date: string;
    }): Promise<{
        message: string;
    }>;
    getSummary(extCode?: string): Promise<{
        daily: any;
        monthly: any;
        summary: {
            totalCallsToday: any;
            totalDurationToday: any;
            averageScoreToday: number;
            totalCallsThisMonth: any;
            totalDurationThisMonth: any;
            averageScoreThisMonth: number;
        };
    }>;
}
