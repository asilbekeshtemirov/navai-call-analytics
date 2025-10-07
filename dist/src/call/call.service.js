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
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { Client } from 'ssh2';
import * as fs from 'fs';
import ExcelJS from 'exceljs';
let CallService = CallService_1 = class CallService {
    prisma;
    configService;
    logger = new Logger(CallService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    sshUploadFile(params) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            conn
                .on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        return reject(new Error(`SFTP error: ${err.message}`));
                    }
                    const readStream = fs.createReadStream(params.localFilePath);
                    const writeStream = sftp.createWriteStream(params.remoteFilePath, {
                        flags: 'w',
                        encoding: null,
                        mode: 0o644,
                    });
                    writeStream.on('close', () => {
                        conn.end();
                        resolve();
                    });
                    writeStream.on('error', (e) => {
                        conn.end();
                        reject(new Error(`File write error: ${e.message}`));
                    });
                    readStream.on('error', (e) => {
                        conn.end();
                        reject(new Error(`File read error: ${e.message}`));
                    });
                    readStream.pipe(writeStream);
                });
            })
                .on('error', (err) => {
                if (err.level === 'client-authentication') {
                    reject(new Error('SSH authentication failed. Please check PRIVATE_KEY_BASE64 in .env file'));
                }
                else if (err.code === 'ECONNREFUSED') {
                    reject(new Error(`Connection refused to ${params.host}:${params.port}. Check if SSH server is running`));
                }
                else if (err.code === 'ETIMEDOUT') {
                    reject(new Error(`Connection timeout to ${params.host}:${params.port}. Check firewall and network`));
                }
                else {
                    reject(new Error(`SSH connection error: ${err.message || err}`));
                }
            })
                .connect({
                host: params.host,
                port: params.port,
                username: params.username,
                privateKey: params.privateKey,
                readyTimeout: 20000,
            });
        });
    }
    sshRunCommand(params) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            let stdout = '';
            let stderr = '';
            conn
                .on('ready', () => {
                conn.exec(params.command, (err, stream) => {
                    if (err) {
                        conn.end();
                        return reject(new Error(`Command execution error: ${err.message}`));
                    }
                    stream
                        .on('close', (code, signal) => {
                        conn.end();
                        resolve({ stdout, stderr, code, signal });
                    })
                        .on('data', (data) => {
                        stdout += data.toString();
                    })
                        .stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                });
            })
                .on('error', (err) => {
                if (err.level === 'client-authentication') {
                    reject(new Error('SSH authentication failed. Please check PRIVATE_KEY_BASE64 in .env file'));
                }
                else if (err.code === 'ECONNREFUSED') {
                    reject(new Error(`Connection refused to ${params.host}:${params.port}. Check if SSH server is running`));
                }
                else if (err.code === 'ETIMEDOUT') {
                    reject(new Error(`Connection timeout to ${params.host}:${params.port}. Check firewall and network`));
                }
                else {
                    reject(new Error(`SSH connection error: ${err.message || err}`));
                }
            })
                .connect({
                host: params.host,
                port: params.port,
                username: params.username,
                privateKey: params.privateKey,
                readyTimeout: 20000,
            });
        });
    }
    async uploadFile(file) {
        const REMOTE_HOST = this.configService.get('REMOTE_HOST');
        const REMOTE_PORT = this.configService.get('REMOTE_PORT', 22);
        const REMOTE_USER = this.configService.get('REMOTE_USER');
        const PRIVATE_KEY_BASE64 = this.configService.get('PRIVATE_KEY_BASE64');
        const REMOTE_PATH = this.configService.get('REMOTE_PATH');
        if (!REMOTE_HOST || !REMOTE_USER || !REMOTE_PATH) {
            throw new BadRequestException('SSH configuration is incomplete. Check REMOTE_HOST, REMOTE_USER, and REMOTE_PATH in .env');
        }
        if (!PRIVATE_KEY_BASE64) {
            throw new BadRequestException('PRIVATE_KEY_BASE64 is not set in .env file. Please follow instructions in .env.example to generate it');
        }
        let PRIVATE_KEY;
        try {
            PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
        }
        catch (err) {
            throw new BadRequestException('PRIVATE_KEY_BASE64 is invalid. Make sure it is a valid base64 encoded string');
        }
        const fileExtension = file.originalname.split('.').pop();
        let totalNumbers = 0;
        if (fileExtension === 'xlsx') {
            const localNumbersPath = 'numbers.txt';
            try {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(file.path);
                const worksheet = workbook.getWorksheet(1);
                if (!worksheet) {
                    throw new Error('The first worksheet is not found in the Excel file.');
                }
                const numbers = [];
                worksheet.eachRow((row) => {
                    const cellValue = row.getCell(1).value;
                    if (cellValue) {
                        numbers.push(cellValue.toString());
                    }
                });
                totalNumbers = numbers.length;
                this.logger.log(`Total numbers: ${totalNumbers}`);
                const numbersTxt = numbers.join('\n');
                fs.writeFileSync(localNumbersPath, numbersTxt);
                await this.sshUploadFile({
                    host: REMOTE_HOST,
                    port: REMOTE_PORT,
                    username: REMOTE_USER,
                    privateKey: PRIVATE_KEY,
                    localFilePath: localNumbersPath,
                    remoteFilePath: REMOTE_PATH,
                });
                return {
                    ok: true,
                    message: 'Excel file processed and uploaded successfully.',
                    remotePath: REMOTE_PATH,
                    totalNumbers: totalNumbers,
                };
            }
            catch (e) {
                this.logger.error('Excel upload or SSH error', e);
                throw e;
            }
            finally {
                fs.unlink(file.path, (err) => { if (err)
                    this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
                fs.unlink(localNumbersPath, (err) => { if (err && err.code !== 'ENOENT')
                    this.logger.error(`Failed to delete temp file: ${localNumbersPath}`, err); });
            }
        }
        else if (fileExtension === 'txt') {
            try {
                const content = fs.readFileSync(file.path, 'utf-8');
                const numbers = content.split('\n').filter(line => line.trim());
                totalNumbers = numbers.length;
                this.logger.log(`Total numbers: ${totalNumbers}`);
                await this.sshUploadFile({
                    host: REMOTE_HOST,
                    port: REMOTE_PORT,
                    username: REMOTE_USER,
                    privateKey: PRIVATE_KEY,
                    localFilePath: file.path,
                    remoteFilePath: REMOTE_PATH,
                });
                return {
                    ok: true,
                    message: 'Text file uploaded successfully.',
                    remotePath: REMOTE_PATH,
                    totalNumbers: totalNumbers,
                };
            }
            catch (e) {
                this.logger.error('TXT upload or SSH error', e);
                throw e;
            }
            finally {
                fs.unlink(file.path, (err) => { if (err)
                    this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
            }
        }
        else {
            fs.unlink(file.path, (err) => { if (err)
                this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
            throw new BadRequestException('Only .xlsx and .txt files are allowed!');
        }
    }
    async startProcess() {
        const REMOTE_HOST = this.configService.get('REMOTE_HOST');
        const REMOTE_PORT = this.configService.get('REMOTE_PORT', 22);
        const REMOTE_USER = this.configService.get('REMOTE_USER');
        const PRIVATE_KEY_BASE64 = this.configService.get('PRIVATE_KEY_BASE64');
        const REMOTE_COMMAND = this.configService.get('REMOTE_COMMAND');
        const REMOTE_PATH = this.configService.get('REMOTE_PATH');
        if (!REMOTE_HOST || !REMOTE_USER || !REMOTE_COMMAND) {
            throw new BadRequestException('SSH configuration is incomplete. Check REMOTE_HOST, REMOTE_USER, and REMOTE_COMMAND in .env');
        }
        if (!PRIVATE_KEY_BASE64) {
            throw new BadRequestException('PRIVATE_KEY_BASE64 is not set in .env file. Please follow instructions in .env.example to generate it');
        }
        let PRIVATE_KEY;
        try {
            PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
        }
        catch (err) {
            throw new BadRequestException('PRIVATE_KEY_BASE64 is invalid. Make sure it is a valid base64 encoded string');
        }
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let totalNumbers = 0;
        try {
            const countResult = await this.sshRunCommand({
                host: REMOTE_HOST,
                port: REMOTE_PORT,
                username: REMOTE_USER,
                privateKey: PRIVATE_KEY,
                command: `wc -l < ${REMOTE_PATH}`,
            });
            if (countResult.stdout) {
                totalNumbers = parseInt(countResult.stdout.trim(), 10) || 0;
                this.logger.log(`Total numbers from remote: ${totalNumbers}`);
            }
        }
        catch (err) {
            this.logger.warn(`Could not count numbers from remote: ${err.message}`);
        }
        const session = await this.prisma.callSession.create({
            data: {
                organizationId: 1,
                sessionId,
                status: 'PENDING',
                totalNumbers: totalNumbers,
            },
        });
        try {
            await this.prisma.callSession.update({
                where: { id: session.id },
                data: { status: 'RUNNING' },
            });
            const commandWithSessionId = `${REMOTE_COMMAND}?session_id=${session.sessionId}`;
            const result = await this.sshRunCommand({
                host: REMOTE_HOST,
                port: REMOTE_PORT,
                username: REMOTE_USER,
                privateKey: PRIVATE_KEY,
                command: commandWithSessionId,
            });
            await this.prisma.callSession.update({
                where: { id: session.id },
                data: {
                    status: result.code === 0 ? 'COMPLETED' : 'FAILED',
                    remoteResponse: result.stdout || result.stderr,
                    completedAt: new Date(),
                },
            });
            return {
                ok: true,
                message: 'Remote process started.',
                sessionId: session.sessionId,
                ...result,
            };
        }
        catch (e) {
            this.logger.error('SSH command execution error', e);
            await this.prisma.callSession.update({
                where: { id: session.id },
                data: {
                    status: 'FAILED',
                    errorMessage: e.message,
                    completedAt: new Date(),
                },
            });
            throw e;
        }
    }
    async findAll(organizationId, filters) {
        const where = {
            organizationId,
        };
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
    async findOne(organizationId, id) {
        return this.prisma.call.findFirst({
            where: {
                id,
                organizationId,
            },
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
    async getSessionStatus(sessionId) {
        const session = await this.prisma.callSession.findUnique({
            where: { sessionId },
        });
        if (!session) {
            throw new BadRequestException(`Session not found: ${sessionId}`);
        }
        let durationSeconds = null;
        if (session.completedAt) {
            durationSeconds = Math.floor((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
        }
        else {
            durationSeconds = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
        }
        let progressPercentage = 0;
        if (session.totalNumbers > 0) {
            progressPercentage = Math.floor((session.processedNumbers / session.totalNumbers) * 100);
        }
        else {
            switch (session.status) {
                case 'PENDING':
                    progressPercentage = 0;
                    break;
                case 'RUNNING':
                    progressPercentage = 50;
                    break;
                case 'COMPLETED':
                    progressPercentage = 100;
                    break;
                case 'FAILED':
                    progressPercentage = 0;
                    break;
            }
        }
        let statusDescription = '';
        switch (session.status) {
            case 'PENDING':
                statusDescription = 'Navbatda...';
                break;
            case 'RUNNING':
                statusDescription = 'Qayta ishlanmoqda...';
                break;
            case 'COMPLETED':
                statusDescription = 'Muvaffaqiyatli tugallandi';
                break;
            case 'FAILED':
                statusDescription = 'Xatolik yuz berdi';
                break;
            default:
                statusDescription = 'Noma\'lum status';
        }
        return {
            ...session,
            durationSeconds,
            progressPercentage,
            statusDescription,
            isRunning: session.status === 'RUNNING',
            isCompleted: session.status === 'COMPLETED' || session.status === 'FAILED',
            hasError: session.status === 'FAILED' || !!session.errorMessage,
        };
    }
    async getAllSessions(limit = 50) {
        const sessions = await this.prisma.callSession.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return sessions.map(session => {
            let durationSeconds = null;
            if (session.completedAt) {
                durationSeconds = Math.floor((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
            }
            else if (session.status === 'RUNNING') {
                durationSeconds = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
            }
            let progressPercentage = 0;
            if (session.totalNumbers > 0) {
                progressPercentage = Math.floor((session.processedNumbers / session.totalNumbers) * 100);
            }
            else {
                switch (session.status) {
                    case 'PENDING':
                        progressPercentage = 0;
                        break;
                    case 'RUNNING':
                        progressPercentage = 50;
                        break;
                    case 'COMPLETED':
                        progressPercentage = 100;
                        break;
                    case 'FAILED':
                        progressPercentage = 0;
                        break;
                }
            }
            let statusDescription = '';
            switch (session.status) {
                case 'PENDING':
                    statusDescription = 'Navbatda...';
                    break;
                case 'RUNNING':
                    statusDescription = 'Qayta ishlanmoqda...';
                    break;
                case 'COMPLETED':
                    statusDescription = 'Muvaffaqiyatli tugallandi';
                    break;
                case 'FAILED':
                    statusDescription = 'Xatolik yuz berdi';
                    break;
                default:
                    statusDescription = 'Noma\'lum status';
                    break;
            }
            return {
                ...session,
                durationSeconds,
                progressPercentage,
                statusDescription,
                isRunning: session.status === 'RUNNING',
                isCompleted: session.status === 'COMPLETED' || session.status === 'FAILED',
                hasError: session.status === 'FAILED' || !!session.errorMessage,
            };
        });
    }
    start() {
        this.logger.log('Call started');
        return { message: 'Call started' };
    }
};
CallService = CallService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], CallService);
export { CallService };
//# sourceMappingURL=call.service.js.map