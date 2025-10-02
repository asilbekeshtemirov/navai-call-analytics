import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';

interface CallData {
  uid: string;
  client: string;
  caller?: string;
  start?: string; // ISO date string from API
  start_time?: number; // Unix timestamp (fallback)
  record?: string;
  type?: string;
  status?: string;
  diversion?: string;
  destination?: string;
  user?: string;
  user_name?: string;
  wait?: number;
  duration?: number;
}

@Injectable()
export class DownloaderService {
  private readonly logger = new Logger(DownloaderService.name);
  private readonly apiUrl!: string;
  private readonly apiKey!: string;
  private readonly saveDir = './recordings';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    this.apiUrl = this.configService.get<string>('SIP_API_URL')!;
    this.apiKey = this.configService.get<string>('SIP_API_KEY')!;

    this.logger.log(`[INIT] SIP_API_URL: ${this.apiUrl}`);
    this.logger.log(`[INIT] SIP_API_KEY length: ${this.apiKey?.length || 0}`);
    this.logger.log(`[INIT] SIP_API_KEY value: "${this.apiKey}"`);

    if (!this.apiUrl || !this.apiKey) {
      this.logger.error(
        'SIP_API_URL or SIP_API_KEY is not set in environment variables.',
      );
      throw new Error('SIP API credentials are missing.');
    }

    if (!fs.existsSync(this.saveDir)) {
      fs.mkdirSync(this.saveDir, { recursive: true });
    }
  }

  @Cron('54 13 * * *')
  async handleCron() {
    this.logger.log('Starting daily call recording download...');
    await this.downloadAndProcessCalls();
  }

  private async downloadAndProcessCalls() {
    try {
      const calls = await this.fetchTodayCalls();
      this.logger.log(`Found ${calls.length} calls with recordings.`);

      for (const call of calls) {
        const fileName = `${call.uid}_${call.client || 'unknown'}.mp3`;
        const filePath = path.join(this.saveDir, fileName);

        try {
          // Log the call data for debugging
          this.logger.log(`Processing call: ${JSON.stringify(call)}`);

          if (!call.record) {
            this.logger.warn(
              `No recording URL for call: ${call.uid}. Skipping.`,
            );
            continue;
          }

          // Try to find employee by phone number - check both client and caller
          let employee = null;
          let employeePhone = null;

          // First, try to find by client number
          if (call.client) {
            employee = await this.prisma.user.findUnique({
              where: { phone: call.client },
            });
            if (employee) {
              employeePhone = call.client;
              this.logger.log(`Employee found by client number: ${call.client}`);
            }
          }

          // If not found, try to find by caller number
          if (!employee && call.caller) {
            employee = await this.prisma.user.findUnique({
              where: { phone: call.caller },
            });
            if (employee) {
              employeePhone = call.caller;
              this.logger.log(`Employee found by caller number: ${call.caller}`);
            }
          }

          // If employee not found, skip this call
          if (!employee) {
            this.logger.warn(
              `Employee not found for phone numbers (client: ${call.client}, caller: ${call.caller}). Skipping call ${call.uid}.`,
            );
            continue;
          }

          // Check if call already exists in database
          const existingCall = await this.prisma.call.findUnique({
            where: { externalId: call.uid },
          });

          if (existingCall) {
            this.logger.log(`Call ${call.uid} already exists in database. Skipping.`);
            continue;
          }

          await this.downloadRecord(call.record, filePath);
          this.logger.log(`Downloaded: ${filePath}`);

          // Parse the call date - handle both ISO string and Unix timestamp formats
          let callDate: Date;
          if (call.start) {
            // API returns ISO date string in 'start' field
            callDate = new Date(call.start);
          } else if (call.start_time) {
            // Fallback to Unix timestamp if available
            callDate = new Date(call.start_time * 1000);
          } else {
            // Last resort: use current date
            callDate = new Date();
          }

          // Validate the date
          if (isNaN(callDate.getTime())) {
            this.logger.warn(`Invalid date for call ${call.uid}, using current date`);
            callDate = new Date();
          }

          // Create a new call record in the database
          const newCall = await this.prisma.call.create({
            data: {
              externalId: call.uid,
              callerNumber: call.caller || 'Unknown', // Handle undefined caller
              calleeNumber: call.client, // Assuming call.client is the employee's number
              callDate: callDate,
              fileUrl: filePath, // Store the local file path
              status: 'UPLOADED',
              employeeId: employee.id, // Assign the found employee's ID
            },
          });

          this.logger.log(`Created new call record: ${newCall.id}`);

          this.aiService.processCall(newCall.id);
        } catch (err) {
          this.logger.error(
            `Failed to process call ${call.uid}: ${err.message}`,
          );
        }
      }
      this.logger.log('Finished downloading and processing calls.');
    } catch (error) {
      this.logger.error("Failed to fetch today's calls:", error.message);
    }
  }

  private async fetchTodayCalls(): Promise<CallData[]> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Fetching calls from: ${this.apiUrl}/history/json (Attempt ${attempt}/${maxRetries})`);
        this.logger.log(`Using API Key: ${this.apiKey ? '***' + this.apiKey.slice(-4) : 'MISSING'}`);

        const { data } = await axios.get(`${this.apiUrl}/history/json`, {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          params: { period: 'today', type: 'all', limit: 1000 },
          timeout: 60000, // Increased to 60 seconds
          httpsAgent: new https.Agent({
            keepAlive: true,
            timeout: 60000,
          }),
        });

        this.logger.log(
          `API Response: ${JSON.stringify(data).substring(0, 200)}`,
        );
        const filteredCalls = data.filter((c: CallData) => c.record);
        this.logger.log(`Successfully fetched ${filteredCalls.length} calls with recordings`);
        return filteredCalls;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMsg = error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED'
          ? `Connection timeout after 60 seconds`
          : error.message;

        this.logger.error(
          `API Error (Attempt ${attempt}/${maxRetries}): ${error.response?.status || 'N/A'} - ${errorMsg}`,
        );

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          this.logger.warn(
            `Network timeout. This could be due to: slow network, firewall, or server issues.`,
          );
        }

        if (!isLastAttempt) {
          const waitTime = retryDelay * attempt;
          this.logger.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          this.logger.error('All retry attempts failed. Returning empty array.');
        }
      }
    }

    return [];
  }

  private async downloadRecord(
    recordUrl: string,
    filePath: string,
  ): Promise<void> {
    const response = await axios.get(recordUrl, {
      responseType: 'stream',
      timeout: 120000, // 2 minutes for large files
      httpsAgent: new https.Agent({
        keepAlive: true,
        timeout: 120000,
      }),
    });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}
