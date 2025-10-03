var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CallService_1;
import { Injectable, Logger, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let CallService = CallService_1 = class CallService {
    prisma;
    logger = new Logger(CallService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.branchId)
            where.branchId = filters.branchId;
        if (filters?.departmentId)
            where.departmentId = filters.departmentId;
        if (filters?.employeeId)
            where.employeeId = filters.employeeId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.createdAt.lte = new Date(filters.dateTo);
        }
        return this.prisma.call.findMany({
            where,
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, extCode: true },
                },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                scores: { include: { criteria: true } },
                violations: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.call.findUnique({
            where: { id },
            include: {
                employee: true,
                manager: true,
                branch: true,
                department: true,
                segments: { orderBy: { startMs: 'asc' } },
                scores: { include: { criteria: true } },
                violations: { orderBy: { timestampMs: 'asc' } },
            },
        });
    }
    async getTranscript(callId) {
        const segments = await this.prisma.transcriptSegment.findMany({
            where: { callId },
            orderBy: { startMs: 'asc' },
        });
        return segments;
    }
};
CallService = CallService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CallService);
export { CallService };
//# sourceMappingURL=call.service.js.map