import { ReportService } from './report.service.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    create(generateReportDto: GenerateReportDto): Promise<{
        id: string;
        createdAt: Date;
        summary: string | null;
        dateFrom: Date;
        dateTo: Date;
        userId: string;
        totalCalls: number;
        totalDuration: number;
        avgScore: number;
    }>;
}
