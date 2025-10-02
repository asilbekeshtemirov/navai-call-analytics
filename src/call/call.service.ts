import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from "crypto";
import { AiService } from '../ai/ai.service.js';
import { HistoryDto, EventDto, ContactDto, RatingDto } from './dto/vats-webhook.dto.js';

@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async handleHistory(data: HistoryDto) {
    this.logger.log(`Handling 'history' command for callId: ${data.callid}`);

    const user = await this.prisma.user.findFirst({ where: { OR: [{ id: data.user }, { extCode: data.user }] } });
    if (!user) {
      throw new NotFoundException(`User not found with identifier: ${data.user}`);
    }

    const existingCall = await this.prisma.call.findUnique({ where: { sipId: data.callid } });
    if (existingCall) {
      this.logger.warn(`Call with sipId ${data.callid} already exists. Skipping creation.`);
      return { message: 'Call already exists' };
    }

    const call = await this.prisma.call.create({
      data: {
        sipId: data.callid,
        employeeId: user.id,
        branchId: user.branchId,
        departmentId: user.departmentId,
        fileUrl: data.link,
        status: 'UPLOADED',
        durationSec: data.duration,
        // TODO: Add other fields from `data` as needed
      },
    });

    // Asynchronously process the call for analysis
    this.aiService.processCall(call.id).catch((err: any) => {
      this.logger.error(`Error processing call ${call.id} in background: ${err.message}`);
    });

    return { message: 'Call received and is being processed.', callId: call.id };
  }

  async handleEvent(data: EventDto) {
    this.logger.log(`Handling 'event' command: ${data.type} for callId: ${data.callid}`);
    // TODO: Implement logic for real-time events, e.g., showing a customer card in the CRM.
    return { message: 'Event received' };
  }

  async handleContact(data: ContactDto) {
    this.logger.log(`Handling 'contact' command for phone: ${data.phone}`);
    const user = await this.prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (user) {
      return {
        contact_name: `${user.firstName} ${user.lastName}`,
        responsible: user.id, // or user.extCode, depending on VATS requirements
      };
    }

    // Optional: Search in a separate contacts table if you have one

    throw new NotFoundException('Contact not found');
  }

  async handleRating(data: RatingDto) {
    this.logger.log(`Handling 'rating' command for callId: ${data.callid}`);
    const call = await this.prisma.call.findUnique({ where: { sipId: data.callid } });

    if (!call) {
      throw new NotFoundException(`Call with sipId ${data.callid} not found`);
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: {
        analysis: {
          ...(call.analysis as any || {}),
          customerRating: data.rating,
        },
      },
    });

    return { message: 'Rating received' };
  }

  async uploadFromUrl(uploadFromUrlDto: UploadFromUrlDto) {
    const { url, employeeId, sipId } = uploadFromUrlDto;

    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
        throw new BadRequestException(`Employee with ID ${employeeId} not found.`);
    }

    const existingCall = await this.prisma.call.findFirst({ where: { sipId } });
    if (existingCall) {
        throw new BadRequestException(`Call with sipId ${sipId} already exists.`);
    }

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const fileExtension = path.extname(parsedUrl.pathname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);

    try {
        await new Promise((resolve, reject) => {
          const request = protocol.get(url, (response) => {
            if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Failed to download file, status code: ${response.statusCode || 'unknown'}`));
            }
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(void 0);
            });
            response.on('error', (err: any) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
          });
          request.on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        });
    } catch (error) {
        throw new InternalServerErrorException(`Failed to download file from URL: ${url}. Error: ${error.message}`);
    }

    const call = await this.prisma.call.create({
      data: {
        sipId,
        employeeId,
        branchId: employee.branchId,
        departmentId: employee.departmentId,
        fileUrl: `/uploads/${fileName}`,
        status: 'UPLOADED',
      },
    });

    return call;
  }

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
        employee: { select: { id: true, firstName: true, lastName: true, extCode: true } },
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