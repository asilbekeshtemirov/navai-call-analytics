import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { Client } from 'ssh2';
import * as fs from 'fs';
import ExcelJS from 'exceljs';

@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private sshUploadFile(params: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.sftp((err: Error | undefined, sftp: any) => {
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

            writeStream.on('error', (e: Error) => {
              conn.end();
              reject(new Error(`File write error: ${e.message}`));
            });

            readStream.on('error', (e: Error) => {
              conn.end();
              reject(new Error(`File read error: ${e.message}`));
            });

            readStream.pipe(writeStream);
          });
        })
        .on('error', (err: any) => {
          if (err.level === 'client-authentication') {
            reject(new Error('SSH authentication failed. Please check PRIVATE_KEY_BASE64 in .env file'));
          } else if (err.code === 'ECONNREFUSED') {
            reject(new Error(`Connection refused to ${params.host}:${params.port}. Check if SSH server is running`));
          } else if (err.code === 'ETIMEDOUT') {
            reject(new Error(`Connection timeout to ${params.host}:${params.port}. Check firewall and network`));
          } else {
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

  private sshRunCommand(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let stdout = '';
      let stderr = '';

      conn
        .on('ready', () => {
          conn.exec(
            params.command,
            (err: Error | undefined, stream: any) => {
              if (err) {
                conn.end();
                return reject(new Error(`Command execution error: ${err.message}`));
              }
              stream
                .on('close', (code: number, signal: string) => {
                  conn.end();
                  resolve({ stdout, stderr, code, signal });
                })
                .on('data', (data: Buffer) => {
                  stdout += data.toString();
                })
                .stderr.on('data', (data: Buffer) => {
                  stderr += data.toString();
                });
            },
          );
        })
        .on('error', (err: any) => {
          if (err.level === 'client-authentication') {
            reject(new Error('SSH authentication failed. Please check PRIVATE_KEY_BASE64 in .env file'));
          } else if (err.code === 'ECONNREFUSED') {
            reject(new Error(`Connection refused to ${params.host}:${params.port}. Check if SSH server is running`));
          } else if (err.code === 'ETIMEDOUT') {
            reject(new Error(`Connection timeout to ${params.host}:${params.port}. Check firewall and network`));
          } else {
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

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const REMOTE_HOST = this.configService.get<string>('REMOTE_HOST');
    const REMOTE_PORT = this.configService.get<number>('REMOTE_PORT', 22);
    const REMOTE_USER = this.configService.get<string>('REMOTE_USER');
    const PRIVATE_KEY_BASE64 =
      this.configService.get<string>('PRIVATE_KEY_BASE64');
    const REMOTE_PATH = this.configService.get<string>('REMOTE_PATH');

    if (!REMOTE_HOST || !REMOTE_USER || !REMOTE_PATH) {
      throw new BadRequestException('SSH configuration is incomplete. Check REMOTE_HOST, REMOTE_USER, and REMOTE_PATH in .env');
    }
    if (!PRIVATE_KEY_BASE64) {
      throw new BadRequestException('PRIVATE_KEY_BASE64 is not set in .env file. Please follow instructions in .env.example to generate it');
    }

    let PRIVATE_KEY: string;
    try {
      PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
    } catch (err) {
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
        const numbers: string[] = [];
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
      } catch (e) {
        this.logger.error('Excel upload or SSH error', e);
        throw e;
      } finally {
        fs.unlink(file.path, (err) => { if (err) this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
        fs.unlink(localNumbersPath, (err) => { if (err && err.code !== 'ENOENT') this.logger.error(`Failed to delete temp file: ${localNumbersPath}`, err); });
      }
    } else if (fileExtension === 'txt') {
      try {
        // Count numbers in txt file
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
      } catch (e) {
        this.logger.error('TXT upload or SSH error', e);
        throw e;
      } finally {
        fs.unlink(file.path, (err) => { if (err) this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
      }
    } else {
      // Using fs.unlink to clean up the unwanted file immediately
      fs.unlink(file.path, (err) => { if (err) this.logger.error(`Failed to delete temp file: ${file.path}`, err); });
      throw new BadRequestException('Only .xlsx and .txt files are allowed!');
    }
  }

  async startProcess(): Promise<any> {
    const REMOTE_HOST = this.configService.get<string>('REMOTE_HOST');
    const REMOTE_PORT = this.configService.get<number>('REMOTE_PORT', 22);
    const REMOTE_USER = this.configService.get<string>('REMOTE_USER');
    const PRIVATE_KEY_BASE64 =
      this.configService.get<string>('PRIVATE_KEY_BASE64');
    const REMOTE_COMMAND = this.configService.get<string>('REMOTE_COMMAND');
    const REMOTE_PATH = this.configService.get<string>('REMOTE_PATH');

    if (!REMOTE_HOST || !REMOTE_USER || !REMOTE_COMMAND) {
      throw new BadRequestException('SSH configuration is incomplete. Check REMOTE_HOST, REMOTE_USER, and REMOTE_COMMAND in .env');
    }
    if (!PRIVATE_KEY_BASE64) {
      throw new BadRequestException('PRIVATE_KEY_BASE64 is not set in .env file. Please follow instructions in .env.example to generate it');
    }

    let PRIVATE_KEY: string;
    try {
      PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
    } catch (err) {
      throw new BadRequestException('PRIVATE_KEY_BASE64 is invalid. Make sure it is a valid base64 encoded string');
    }

    // Generate unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Count numbers from remote server
    let totalNumbers = 0;
    try {
      const countResult: any = await this.sshRunCommand({
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
    } catch (err) {
      this.logger.warn(`Could not count numbers from remote: ${err.message}`);
    }

    // Create session in database
    const session = await this.prisma.callSession.create({
      data: {
        sessionId,
        status: 'PENDING',
        totalNumbers: totalNumbers,
      },
    });

    try {
      // Update session to RUNNING
      await this.prisma.callSession.update({
        where: { id: session.id },
        data: { status: 'RUNNING' },
      });

      // Add session_id to remote command
      const commandWithSessionId = `${REMOTE_COMMAND}?session_id=${session.sessionId}`;

      const result: any = await this.sshRunCommand({
        host: REMOTE_HOST,
        port: REMOTE_PORT,
        username: REMOTE_USER,
        privateKey: PRIVATE_KEY,
        command: commandWithSessionId,
      });

      // Update session with result
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
    } catch (e) {
      this.logger.error('SSH command execution error', e);

      // Update session as FAILED
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

  async getSessionStatus(sessionId: string) {
    const session = await this.prisma.callSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new BadRequestException(`Session not found: ${sessionId}`);
    }

    // Calculate duration in seconds
    let durationSeconds: number | null = null;
    if (session.completedAt) {
      durationSeconds = Math.floor(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
      );
    } else {
      // If still running, calculate duration from now
      durationSeconds = Math.floor(
        (new Date().getTime() - session.startedAt.getTime()) / 1000
      );
    }

    // Calculate progress percentage
    let progressPercentage = 0;
    if (session.totalNumbers > 0) {
      progressPercentage = Math.floor(
        (session.processedNumbers / session.totalNumbers) * 100
      );
    } else {
      // If totalNumbers not set, use status-based percentage
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

    // Status description in Uzbek
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
      // Additional computed fields
      isRunning: session.status === 'RUNNING',
      isCompleted: session.status === 'COMPLETED' || session.status === 'FAILED',
      hasError: session.status === 'FAILED' || !!session.errorMessage,
    };
  }

  async getAllSessions(limit: number = 50) {
    const sessions = await this.prisma.callSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Enrich each session with computed fields
    return sessions.map(session => {
      // Calculate duration
      let durationSeconds: number | null = null;
      if (session.completedAt) {
        durationSeconds = Math.floor(
          (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
        );
      } else if (session.status === 'RUNNING') {
        durationSeconds = Math.floor(
          (new Date().getTime() - session.startedAt.getTime()) / 1000
        );
      }

      // Calculate progress
      let progressPercentage = 0;
      if (session.totalNumbers > 0) {
        progressPercentage = Math.floor(
          (session.processedNumbers / session.totalNumbers) * 100
        );
      } else {
        switch (session.status) {
          case 'PENDING': progressPercentage = 0; break;
          case 'RUNNING': progressPercentage = 50; break;
          case 'COMPLETED': progressPercentage = 100; break;
          case 'FAILED': progressPercentage = 0; break;
        }
      }

      // Status description
      let statusDescription = '';
      switch (session.status) {
        case 'PENDING': statusDescription = 'Navbatda...'; break;
        case 'RUNNING': statusDescription = 'Qayta ishlanmoqda...'; break;
        case 'COMPLETED': statusDescription = 'Muvaffaqiyatli tugallandi'; break;
        case 'FAILED': statusDescription = 'Xatolik yuz berdi'; break;
        default: statusDescription = 'Noma\'lum status'; break;
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
}