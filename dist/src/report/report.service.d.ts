import { GenerateReportDto } from './dto/generate-report.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class ReportService {
    private prisma;
    constructor(prisma: PrismaService);
    generate(generateReportDto: GenerateReportDto): Promise<{
        id: string;
        createdAt: Date;
        dateFrom: Date;
        dateTo: Date;
        summary: string | null;
        userId: string;
        totalCalls: number;
        totalDuration: number;
        avgScore: number;
    }>;
}
