import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}



  async findAll(filters?: {
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};

    if (filters?.branchId) where.branchId = filters.branchId;
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
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

  async findOne(id: string) {
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

  async getTranscript(callId: string) {
    const segments = await this.prisma.transcriptSegment.findMany({
      where: { callId },
      orderBy: { startMs: 'asc' },
    });
    return segments;
  }
}
