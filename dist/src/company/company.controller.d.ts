import { CompanyService } from './company.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getEmployeesPerformance(organizationId: number, period?: string): Promise<any>;
    getRecentCalls(organizationId: number, limit?: string): Promise<any>;
    getUnifiedStatistics(organizationId: number, filters: UnifiedStatisticsDto): Promise<any>;
}
