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
import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { AiService } from '../ai/ai.service.js';
let CallService = CallService_1 = class CallService {
    prisma;
    aiService;
    logger = new Logger(CallService_1.name);
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async handleHistory(data) {
        this.logger.log(`Handling 'history' command for callId: ${data.callid}`);
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ id: data.user }, { extCode: data.user }] },
        });
        if (!user) {
            throw new NotFoundException(`User not found with identifier: ${data.user}`);
        }
        const existingCall = await this.prisma.call.findUnique({
            where: { externalId: data.callid },
        });
        if (existingCall) {
            this.logger.warn(`Call with externalId ${data.callid} already exists. Skipping creation.`);
            return { message: 'Call already exists' };
        }
        const call = await this.prisma.call.create({
            data: {
                externalId: data.callid,
                callDate: new Date(),
                employeeId: user.id,
                branchId: user.branchId,
                departmentId: user.departmentId,
                fileUrl: data.link,
                status: 'UPLOADED',
                durationSec: data.duration,
            },
        });
        this.aiService.processCall(call.id).catch((err) => {
            this.logger.error(`Error processing call ${call.id} in background: ${err.message}`);
        });
        return {
            message: 'Call received and is being processed.',
            callId: call.id,
        };
    }
    async handleEvent(data) {
        this.logger.log(`Handling 'event' command: ${data.type} for callId: ${data.callid}`);
        return { message: 'Event received' };
    }
    async handleContact(data) {
        this.logger.log(`Handling 'contact' command for phone: ${data.phone}`);
        const user = await this.prisma.user.findFirst({
            where: { phone: data.phone },
        });
        if (user) {
            return {
                contact_name: `${user.firstName} ${user.lastName}`,
                responsible: user.id,
            };
        }
        throw new NotFoundException('Contact not found');
    }
    async handleRating(data) {
        this.logger.log(`Handling 'rating' command for callId: ${data.callid}`);
        const call = await this.prisma.call.findUnique({
            where: { externalId: data.callid },
        });
        if (!call) {
            throw new NotFoundException(`Call with externalId ${data.callid} not found`);
        }
        await this.prisma.call.update({
            where: { id: call.id },
            data: {
                analysis: {
                    ...(call.analysis || {}),
                    customerRating: data.rating,
                },
            },
        });
        return { message: 'Rating received' };
    }
    async create(createCallDto) {
        const { employeeId, callerNumber, calleeNumber, durationSec, audioUrl } = createCallDto;
        const employee = await this.prisma.user.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new BadRequestException(`Employee with ID ${employeeId} not found.`);
        }
        const call = await this.prisma.call.create({
            data: {
                externalId: `manual-${randomUUID()}`,
                callDate: new Date(),
                employeeId,
                branchId: employee.branchId,
                departmentId: employee.departmentId,
                fileUrl: audioUrl || '',
                status: 'UPLOADED',
                callerNumber,
                calleeNumber,
                durationSec,
            },
        });
        if (audioUrl) {
            this.aiService.processCall(call.id).catch((err) => {
                this.logger.error(`Error processing call ${call.id} in background: ${err.message}`);
            });
        }
        return call;
    }
    async createManualCall(data) {
        const { employeeId, callerNumber, calleeNumber, durationSec, audioUrl } = data;
        const employee = await this.prisma.user.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new BadRequestException(`Employee with ID ${employeeId} not found.`);
        }
        const call = await this.prisma.call.create({
            data: {
                externalId: `manual-${randomUUID()}`,
                callDate: new Date(),
                employeeId,
                branchId: employee.branchId,
                departmentId: employee.departmentId,
                fileUrl: audioUrl || '',
                status: 'UPLOADED',
                callerNumber,
                calleeNumber,
                durationSec,
            },
        });
        if (audioUrl) {
            this.aiService.processCall(call.id).catch((err) => {
                this.logger.error(`Error processing call ${call.id} in background: ${err.message}`);
            });
        }
        return call;
    }
    async uploadFromUrl(uploadFromUrlDto) {
        const { url, employeeId, sipId } = uploadFromUrlDto;
        const employee = await this.prisma.user.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new BadRequestException(`Employee with ID ${employeeId} not found.`);
        }
        const existingCall = await this.prisma.call.findFirst({
            where: { externalId: sipId },
        });
        if (existingCall) {
            throw new BadRequestException(`Call with externalId ${sipId} already exists.`);
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
                    if (!response.statusCode ||
                        response.statusCode < 200 ||
                        response.statusCode >= 300) {
                        return reject(new Error(`Failed to download file, status code: ${response.statusCode || 'unknown'}`));
                    }
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(void 0);
                    });
                    response.on('error', (err) => {
                        fs.unlink(filePath, () => { });
                        reject(err);
                    });
                });
                request.on('error', (err) => {
                    fs.unlink(filePath, () => { });
                    reject(err);
                });
            });
        }
        catch (error) {
            throw new InternalServerErrorException(`Failed to download file from URL: ${url}. Error: ${error.message}`);
        }
        const call = await this.prisma.call.create({
            data: {
                externalId: sipId,
                callDate: new Date(),
                employeeId,
                branchId: employee.branchId,
                departmentId: employee.departmentId,
                fileUrl: `/uploads/${fileName}`,
                status: 'UPLOADED',
            },
        });
        return call;
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
    __metadata("design:paramtypes", [PrismaService,
        AiService])
], CallService);
export { CallService };
//# sourceMappingURL=call.service.js.map