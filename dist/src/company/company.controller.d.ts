import { CompanyService } from './company.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getEmployeesPerformance(period?: string): Promise<any>;
    getRecentCalls(limit?: string): Promise<any>;
    getUnifiedStatistics(filters: UnifiedStatisticsDto): Promise<any>;
}
