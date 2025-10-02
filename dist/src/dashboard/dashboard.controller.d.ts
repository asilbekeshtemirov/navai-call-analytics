import { DashboardService } from './dashboard.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(filters: DashboardFilterDto): Promise<{
        totalCalls: number;
        totalDuration: number;
        totalDepartments: number;
        totalEmployees: number;
    }>;
    getCallsOverTime(filters: DashboardFilterDto): Promise<{
        date: string;
        count: number;
    }[]>;
    getTopPerformers(filters: DashboardFilterDto, limit?: number): Promise<{
        employeeId: any;
        employeeName: string;
        avgScore: number;
        callCount: any;
    }[]>;
    getViolationStats(filters: DashboardFilterDto): Promise<{
        type: string;
        count: number;
    }[]>;
    getAnalysisStats(filters: DashboardFilterDto): Promise<{
        avgOverallScore: number;
        criteriaStats: {
            criteriaId: string;
            name: string;
            avgScore: number;
        }[];
    }>;
}
