var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let ReportService = class ReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(generateReportDto) {
        const { userId, dateFrom, dateTo } = generateReportDto;
        const calls = await this.prisma.call.findMany({
            where: {
                employeeId: userId,
                createdAt: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo),
                },
            },
            include: {
                scores: true,
            },
        });
        const totalCalls = calls.length;
        const totalDuration = calls.reduce((sum, call) => sum + (call.durationSec || 0), 0);
        const allScores = calls.flatMap((call) => call.scores.map((score) => score.score));
        const avgScore = allScores.length > 0
            ? allScores.reduce((sum, score) => sum + score, 0) /
                allScores.length
            : 0;
        const summary = `Report for user ${userId} from ${dateFrom} to ${dateTo}. Total calls: ${totalCalls}. Average score: ${avgScore.toFixed(2)}.`;
        return this.prisma.report.create({
            data: {
                userId,
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo),
                totalCalls,
                totalDuration,
                avgScore,
                summary,
            },
        });
    }
};
ReportService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ReportService);
export { ReportService };
//# sourceMappingURL=report.service.js.map