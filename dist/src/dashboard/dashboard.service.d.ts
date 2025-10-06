import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardFilterDto } from './dto/dashboard-filter.dto.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(filters: DashboardFilterDto): Promise<any>;
    getCallsOverTime(filters: DashboardFilterDto): Promise<any>;
    getTopPerformers(filters: DashboardFilterDto, limit?: number): Promise<any>;
    getViolationStats(filters: DashboardFilterDto): Promise<any>;
    getAnalysisStats(filters: DashboardFilterDto): Promise<any>;
}
