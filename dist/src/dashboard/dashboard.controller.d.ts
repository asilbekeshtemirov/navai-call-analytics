import { DashboardService } from './dashboard.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(filters: DashboardFilterDto): Promise<any>;
    getCallsOverTime(filters: DashboardFilterDto): Promise<any>;
    getTopPerformers(filters: DashboardFilterDto, limit?: number): Promise<any>;
    getViolationStats(filters: DashboardFilterDto): Promise<any>;
    getAnalysisStats(filters: DashboardFilterDto): Promise<any>;
}
