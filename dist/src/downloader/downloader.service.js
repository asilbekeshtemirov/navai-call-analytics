var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DownloaderService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
let DownloaderService = DownloaderService_1 = class DownloaderService {
    configService;
    prisma;
    aiService;
    logger = new Logger(DownloaderService_1.name);
    apiUrl;
    apiKey;
    saveDir = './recordings';
    constructor(configService, prisma, aiService) {
        this.configService = configService;
        this.prisma = prisma;
        this.aiService = aiService;
        this.apiUrl = this.configService.get('SIP_API_URL');
        this.apiKey = this.configService.get('SIP_API_KEY');
        this.logger.log(`[INIT] SIP_API_URL: ${this.apiUrl}`);
        this.logger.log(`[INIT] SIP_API_KEY length: ${this.apiKey?.length || 0}`);
        this.logger.log(`[INIT] SIP_API_KEY value: "${this.apiKey}"`);
        if (!this.apiUrl || !this.apiKey) {
            this.logger.error('SIP_API_URL or SIP_API_KEY is not set in environment variables.');
            throw new Error('SIP API credentials are missing.');
        }
        if (!fs.existsSync(this.saveDir)) {
            fs.mkdirSync(this.saveDir, { recursive: true });
        }
    }
    async handleCron() {
        this.logger.log('Starting daily call recording download...');
        await this.downloadAndProcessCalls();
    }
    async downloadAndProcessCalls() {
        try {
            const calls = await this.fetchTodayCalls();
            this.logger.log(`Found ${calls.length} calls with recordings.`);
            for (const call of calls) {
                const fileName = `${call.uid}_${call.client || 'unknown'}.mp3`;
                const filePath = path.join(this.saveDir, fileName);
                try {
                    this.logger.log(`Processing call: ${JSON.stringify(call)}`);
                    if (!call.record) {
                        this.logger.warn(`No recording URL for call: ${call.uid}. Skipping.`);
                        continue;
                    }
                    let employee = null;
                    let employeePhone = null;
                    if (call.client) {
                        employee = await this.prisma.user.findUnique({
                            where: { phone: call.client },
                        });
                        if (employee) {
                            employeePhone = call.client;
                            this.logger.log(`Employee found by client number: ${call.client}`);
                        }
                    }
                    if (!employee && call.caller) {
                        employee = await this.prisma.user.findUnique({
                            where: { phone: call.caller },
                        });
                        if (employee) {
                            employeePhone = call.caller;
                            this.logger.log(`Employee found by caller number: ${call.caller}`);
                        }
                    }
                    if (!employee) {
                        this.logger.warn(`Employee not found for phone numbers (client: ${call.client}, caller: ${call.caller}). Skipping call ${call.uid}.`);
                        continue;
                    }
                    const existingCall = await this.prisma.call.findUnique({
                        where: { externalId: call.uid },
                    });
                    if (existingCall) {
                        this.logger.log(`Call ${call.uid} already exists in database. Skipping.`);
                        continue;
                    }
                    await this.downloadRecord(call.record, filePath);
                    this.logger.log(`Downloaded: ${filePath}`);
                    let callDate;
                    if (call.start) {
                        callDate = new Date(call.start);
                    }
                    else if (call.start_time) {
                        callDate = new Date(call.start_time * 1000);
                    }
                    else {
                        callDate = new Date();
                    }
                    if (isNaN(callDate.getTime())) {
                        this.logger.warn(`Invalid date for call ${call.uid}, using current date`);
                        callDate = new Date();
                    }
                    const newCall = await this.prisma.call.create({
                        data: {
                            externalId: call.uid,
                            callerNumber: call.caller || 'Unknown',
                            calleeNumber: call.client,
                            callDate: callDate,
                            fileUrl: filePath,
                            status: 'UPLOADED',
                            employeeId: employee.id,
                        },
                    });
                    this.logger.log(`Created new call record: ${newCall.id}`);
                    this.aiService.processCall(newCall.id);
                }
                catch (err) {
                    this.logger.error(`Failed to process call ${call.uid}: ${err.message}`);
                }
            }
            this.logger.log('Finished downloading and processing calls.');
        }
        catch (error) {
            this.logger.error("Failed to fetch today's calls:", error.message);
        }
    }
    async fetchTodayCalls() {
        const maxRetries = 3;
        const retryDelay = 5000;
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
                    timeout: 60000,
                    httpsAgent: new https.Agent({
                        keepAlive: true,
                        timeout: 60000,
                    }),
                });
                this.logger.log(`API Response: ${JSON.stringify(data).substring(0, 200)}`);
                const filteredCalls = data.filter((c) => c.record);
                this.logger.log(`Successfully fetched ${filteredCalls.length} calls with recordings`);
                return filteredCalls;
            }
            catch (error) {
                const isLastAttempt = attempt === maxRetries;
                const errorMsg = error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED'
                    ? `Connection timeout after 60 seconds`
                    : error.message;
                this.logger.error(`API Error (Attempt ${attempt}/${maxRetries}): ${error.response?.status || 'N/A'} - ${errorMsg}`);
                if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    this.logger.warn(`Network timeout. This could be due to: slow network, firewall, or server issues.`);
                }
                if (!isLastAttempt) {
                    const waitTime = retryDelay * attempt;
                    this.logger.log(`Retrying in ${waitTime / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
                else {
                    this.logger.error('All retry attempts failed. Returning empty array.');
                }
            }
        }
        return [];
    }
    async downloadRecord(recordUrl, filePath) {
        const response = await axios.get(recordUrl, {
            responseType: 'stream',
            timeout: 120000,
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
};
__decorate([
    Cron('54 13 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DownloaderService.prototype, "handleCron", null);
DownloaderService = DownloaderService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        PrismaService,
        AiService])
], DownloaderService);
export { DownloaderService };
//# sourceMappingURL=downloader.service.js.map