import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
