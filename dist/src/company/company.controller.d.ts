import { CompanyService } from './company.service.js';
import { UnifiedStatisticsDto } from './dto/unified-statistics.dto.js';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getEmployeesPerformance(period?: string): Promise<{
        employee: {
            id: string;
            name: string;
            extCode: string | null;
        };
        stats: {
            totalCalls: number;
            totalDuration: number;
            avgScore: number;
        };
    }[]>;
    getRecentCalls(limit?: string): Promise<({
        employee: {
            extCode: string | null;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getUnifiedStatistics(filters: UnifiedStatisticsDto): Promise<any>;
}
