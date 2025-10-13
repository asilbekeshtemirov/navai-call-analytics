var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SipuniService_1;
import { Injectable, Logger, forwardRef, Inject, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
let SipuniService = SipuniService_1 = class SipuniService {
    config;
    prisma;
    http;
    aiService;
    schedulerRegistry;
    logger = new Logger(SipuniService_1.name);
    saveDir = './recordings';
    sipuniApiUrl;
    sipuniApiKey;
    sipuniUserId;
    constructor(config, prisma, http, aiService, schedulerRegistry) {
        this.config = config;
        this.prisma = prisma;
        this.http = http;
        this.aiService = aiService;
        this.schedulerRegistry = schedulerRegistry;
        this.sipuniApiUrl =
            this.config.get('SIPUNI_API_URL') || 'https://sipuni.com/api';
        this.sipuniApiKey = this.config.get('SIPUNI_API_KEY') || '';
        this.sipuniUserId = this.config.get('SIPUNI_USER_ID') || '';
        this.logger.log(`[INIT] Sipuni Service initialized (will use Settings for actual credentials)`);
        if (!fs.existsSync(this.saveDir)) {
            fs.mkdirSync(this.saveDir, { recursive: true });
        }
    }
    async onModuleInit() {
        this.logger.log('[STARTUP] Initializing Sipuni auto-sync...');
        try {
            const organizations = await this.prisma.organization.findMany({
                where: { isActive: true },
                include: { settings: true },
            });
            this.logger.log(`[STARTUP] Found ${organizations.length} active organizations`);
            for (const org of organizations) {
                try {
                    const settings = org.settings?.[0];
                    if (settings?.syncSchedule) {
                        await this.setupDynamicCronJob(org.id, org.name, settings.syncSchedule);
                    }
                    if (settings?.autoSyncOnStartup) {
                        this.logger.log(`[STARTUP] Auto-sync is enabled for ${org.name}, but skipping startup sync to prevent automatic execution`);
                        this.logger.log(`[STARTUP] To manually sync, use the API endpoint or frontend interface`);
                    }
                    else {
                        this.logger.log(`[STARTUP] Auto-sync disabled for ${org.name}, skipping...`);
                    }
                }
                catch (error) {
                    this.logger.error(`[STARTUP] Failed to initialize ${org.name}: ${error.message}`);
                }
            }
            this.logger.log('[STARTUP] Sipuni auto-sync initialization completed');
        }
        catch (error) {
            this.logger.error(`[STARTUP] Failed to initialize auto-sync: ${error.message}`);
        }
    }
    async setupDynamicCronJob(orgId, orgName, cronSchedule) {
        try {
            const jobName = `sipuni-sync-${orgId}`;
            try {
                this.schedulerRegistry.deleteCronJob(jobName);
                this.logger.log(`[CRON] Removed existing job for ${orgName}`);
            }
            catch (e) {
            }
            const job = new CronJob(cronSchedule, async () => {
                this.logger.log(`[CRON] Running scheduled sync for ${orgName} (${cronSchedule})`);
                await this.syncAndProcessRecordings(orgId, 500);
            });
            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();
            this.logger.log(`[CRON] Setup dynamic job for ${orgName}: ${cronSchedule}`);
        }
        catch (error) {
            this.logger.error(`[CRON] Failed to setup job for ${orgName}: ${error.message}`);
        }
    }
    async syncFromMonthStart(organizationId) {
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const fromDate = this.formatDateForSipuni(monthStart);
            const toDate = this.formatDateForSipuni(now);
            this.logger.log(`[STARTUP] Syncing from ${fromDate} to ${toDate} for org ${organizationId}`);
            const result = await this.syncAndProcessRecordings(organizationId, 1000);
            this.logger.log(`[STARTUP] Sync completed for org ${organizationId}: ${result.message}`);
        }
        catch (error) {
            this.logger.error(`[STARTUP] Failed to sync from month start for org ${organizationId}: ${error.message}`);
        }
    }
    formatDateForSipuni(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    async loadSipuniCredentials(organizationId) {
        const settings = await this.prisma.setting.findFirst({
            where: { organizationId },
        });
        this.logger.log(`[CONFIG] Loaded settings for org ${organizationId}: ${JSON.stringify(settings)}`);
        if (settings &&
            settings.sipuniApiUrl &&
            settings.sipuniApiKey &&
            settings.sipuniUserId) {
            this.logger.log(`[CONFIG] Using Sipuni credentials from Settings for org ${organizationId}`);
            return {
                apiUrl: settings.sipuniApiUrl,
                apiKey: settings.sipuniApiKey,
                userId: settings.sipuniUserId,
            };
        }
        this.logger.log(`[CONFIG] Using Sipuni credentials from .env (fallback) for org ${organizationId}`);
        return {
            apiUrl: this.sipuniApiUrl,
            apiKey: this.sipuniApiKey,
            userId: this.sipuniUserId,
        };
    }
    createHashString(exportDto, apiKey, userId) {
        const params = [
            exportDto.anonymous || '1',
            exportDto.crmLinks || '0',
            exportDto.dtmfUserAnswer || '0',
            exportDto.firstTime || '0',
            exportDto.from,
            exportDto.fromNumber || '',
            exportDto.hangupinitor || '1',
            exportDto.ignoreSpecChar || '1',
            exportDto.names || '0',
            exportDto.numbersInvolved || '0',
            exportDto.numbersRinged || '0',
            exportDto.outgoingLine || '1',
            exportDto.rating || '5',
            exportDto.showTreeId || '1',
            exportDto.state || '0',
            exportDto.timeFrom || '10:00',
            exportDto.timeTo || '20:00',
            exportDto.to,
            exportDto.toAnswer || '',
            exportDto.toNumber || '',
            exportDto.tree || '',
            exportDto.type || '0',
            exportDto.user || userId,
            apiKey,
        ];
        return params.join('+');
    }
    async exportStatistics(organizationId, exportDto) {
        try {
            this.logger.log(`[EXPORT] Exporting statistics from ${exportDto.from} to ${exportDto.to} for org ${organizationId}`);
            const credentials = await this.loadSipuniCredentials(organizationId);
            if (!credentials.apiKey || credentials.apiKey.length === 0) {
                throw new Error('SIPUNI_API_KEY is not configured');
            }
            const hashString = this.createHashString(exportDto, credentials.apiKey, credentials.userId);
            this.logger.log(`[HASH] Hash string: ${hashString}`);
            const hash = crypto.createHash('md5').update(hashString).digest('hex');
            const params = {
                ...exportDto,
                anonymous: exportDto.anonymous || '1',
                crmLinks: exportDto.crmLinks || '0',
                dtmfUserAnswer: exportDto.dtmfUserAnswer || '0',
                firstTime: exportDto.firstTime || '0',
                fromNumber: exportDto.fromNumber || '',
                hangupinitor: exportDto.hangupinitor || '1',
                ignoreSpecChar: exportDto.ignoreSpecChar || '1',
                names: exportDto.names || '0',
                numbersInvolved: exportDto.numbersInvolved || '0',
                numbersRinged: exportDto.numbersRinged || '0',
                outgoingLine: exportDto.outgoingLine || '1',
                rating: exportDto.rating || '5',
                showTreeId: exportDto.showTreeId || '1',
                state: exportDto.state || '0',
                timeFrom: exportDto.timeFrom || '10:00',
                timeTo: exportDto.timeTo || '20:00',
                toAnswer: exportDto.toAnswer || '',
                toNumber: exportDto.toNumber || '',
                tree: exportDto.tree || '',
                type: exportDto.type || '0',
                user: exportDto.user || credentials.userId,
                hash,
            };
            const response = await this.http.axiosRef.post(`${credentials.apiUrl}/statistic/export`, new URLSearchParams(params).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 120000,
            });
            const responseData = response.data;
            if (typeof responseData === 'string' && responseData.includes('<html>')) {
                throw new Error('Sipuni API returned HTML error page instead of CSV data');
            }
            this.logger.log(`[EXPORT] Successfully fetched ${responseData.split('\n').length - 1} records`);
            return responseData;
        }
        catch (error) {
            this.logger.error(`[EXPORT] Failed to export statistics: ${error.message}`);
            throw error;
        }
    }
    async fetchCallRecords(organizationId, from, to) {
        this.logger.log(`[FETCH] Fetching call records from ${from} to ${to} for org ${organizationId}`);
        const csvData = await this.exportStatistics(organizationId, {
            user: this.sipuniUserId,
            from,
            to,
            type: '0',
            state: '0',
        });
        const records = this.parseCsvToCallRecords(csvData);
        this.logger.log(`[FETCH] Found ${records.length} call records`);
        return records;
    }
    parseCsvToCallRecords(csvData) {
        if (csvData.includes('<html>')) {
            throw new Error('Sipuni API returned HTML error page instead of CSV data');
        }
        return csvData
            .split('\n')
            .slice(1)
            .filter((line) => line.trim())
            .map((line, i) => {
            const cols = line.split(',');
            return {
                uid: cols[0] || `sipuni_${Date.now()}_${i}`,
                client: cols[1] || '',
                caller: cols[2] || '',
                start: cols[3] || '',
                duration: parseInt(cols[4]) || 0,
                record: cols[5] || '',
                type: cols[6] || '',
                status: cols[7] || '',
                user: cols[8] || '',
                user_name: cols[9] || '',
            };
        })
            .filter((record) => record.record?.trim());
    }
    async testConnection(organizationId) {
        const credentials = await this.loadSipuniCredentials(organizationId);
        const source = credentials.apiKey === this.sipuniApiKey ? '.env' : 'Settings';
        return {
            apiUrl: credentials.apiUrl,
            hasApiKey: !!credentials.apiKey && credentials.apiKey.length > 0,
            hasUserId: !!credentials.userId && credentials.userId.length > 0,
            source,
        };
    }
    async manualSync(organizationId, from, to) {
        try {
            this.logger.log(`[MANUAL] Manual sync requested from ${from} to ${to} for org ${organizationId}`);
            const callRecords = await this.fetchCallRecords(organizationId, from, to);
            const results = await Promise.allSettled(callRecords.map((record) => this.processCallRecord(record)));
            const processedCount = results.filter((r) => r.status === 'fulfilled').length;
            const message = `Successfully processed ${processedCount} out of ${callRecords.length} call records`;
            this.logger.log(`[MANUAL] ${message}`);
            return { success: true, message, recordsProcessed: processedCount };
        }
        catch (error) {
            this.logger.error(`[MANUAL] Manual sync failed: ${error.message}`);
            return {
                success: false,
                message: `Manual sync failed: ${error.message}`,
                recordsProcessed: 0,
            };
        }
    }
    async processCallRecord(record) {
        if (record.record?.startsWith('http')) {
            try {
                const audioFile = await this.downloadRecording(record.record, record.uid);
                this.logger.log(`[RECORD] Successfully downloaded recording for ${record.uid}: ${audioFile}`);
            }
            catch (error) {
                this.logger.warn(`[RECORD] Failed to download recording for ${record.uid}: ${error.message}`);
            }
        }
        else {
            this.logger.log(`[RECORD] No recording URL for ${record.uid}`);
        }
    }
    async downloadRecording(url, uid) {
        const filepath = path.join(this.saveDir, `${uid}.mp3`);
        if (fs.existsSync(filepath)) {
            this.logger.log(`[DOWNLOAD] File already exists: ${filepath}`);
            return filepath;
        }
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            https
                .get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    this.logger.log(`[DOWNLOAD] File saved: ${filepath}`);
                    resolve(filepath);
                });
                file.on('error', (error) => {
                    fs.unlink(filepath, () => { });
                    reject(error);
                });
            })
                .on('error', reject);
        });
    }
    async transcribeAudio(audioFile) {
        return '';
    }
    async fetchAllRecords(organizationId, limit = 500, order = 'desc', page = 1) {
        this.logger.log(`[FETCH_ALL] Fetching records for org ${organizationId} (limit: ${limit}, order: ${order}, page: ${page})`);
        try {
            const credentials = await this.loadSipuniCredentials(organizationId);
            const hashString = [
                limit,
                order,
                page,
                credentials.userId,
                credentials.apiKey,
            ].join('+');
            const hash = crypto.createHash('md5').update(hashString).digest('hex');
            this.logger.log(`[HASH] Hash calculated (using ${credentials.apiKey === this.sipuniApiKey ? '.env' : 'Settings'} credentials)`);
            const response = await axios.post(`${credentials.apiUrl}/statistic/export/all`, new URLSearchParams({
                limit: limit.toString(),
                order,
                page: page.toString(),
                user: credentials.userId,
                hash,
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 120000,
            });
            const csvData = response.data;
            const lines = csvData.split('\n').filter((l) => l.trim());
            this.logger.log(`[FETCH_ALL] Fetched ${lines.length - 1} records`);
            const records = lines.slice(1).map((line) => {
                const cols = line.split(';');
                return {
                    type: cols[0],
                    status: cols[1],
                    time: cols[2],
                    tree: cols[3],
                    from: cols[4],
                    to: cols[5],
                    answered: cols[6],
                    duration: cols[7],
                    talkDuration: cols[8],
                    answerTime: cols[9],
                    rating: cols[10],
                    recordId: cols[11],
                    label: cols[12],
                    tags: cols[13],
                    orderId: cols[14],
                    recordExists: cols[15],
                    newClient: cols[16],
                };
            });
            this.logger.log(`[FETCH_ALL] Found ${records.length} calls total`);
            const withRecording = records.filter((r) => r.recordId && r.recordId.trim() !== '');
            const withoutRecording = records.length - withRecording.length;
            this.logger.log(`[FETCH_ALL] ${withRecording.length} with recording, ${withoutRecording} without recording`);
            return records;
        }
        catch (error) {
            this.logger.error(`[FETCH_ALL] Failed to fetch records: ${error.message}`);
            throw error;
        }
    }
    async downloadRecordingById(organizationId, recordId, filename) {
        const filepath = path.join(this.saveDir, `${filename}.mp3`);
        if (fs.existsSync(filepath)) {
            this.logger.log(`[DOWNLOAD] File already exists: ${filepath}`);
            return filepath;
        }
        try {
            const credentials = await this.loadSipuniCredentials(organizationId);
            const hashString = [
                recordId,
                credentials.userId,
                credentials.apiKey,
            ].join('+');
            const hash = crypto.createHash('md5').update(hashString).digest('hex');
            const response = await axios.post(`${credentials.apiUrl}/statistic/record`, new URLSearchParams({
                id: recordId,
                user: credentials.userId,
                hash,
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                responseType: 'arraybuffer',
                timeout: 60000,
                validateStatus: (status) => status < 500,
            });
            if (response.status === 404) {
                this.logger.warn(`[DOWNLOAD] Recording not found (404) for recordId: ${recordId}`);
                throw new Error('Recording not found (404)');
            }
            if (response.status !== 200) {
                this.logger.warn(`[DOWNLOAD] Unexpected status ${response.status} for recordId: ${recordId}`);
                throw new Error(`Unexpected status: ${response.status}`);
            }
            fs.writeFileSync(filepath, response.data);
            const sizeKB = Math.round(response.data.length / 1024);
            this.logger.log(`[DOWNLOAD] Downloaded ${sizeKB} KB to ${filepath}`);
            return filepath;
        }
        catch (error) {
            this.logger.error(`[DOWNLOAD] Failed to download ${recordId}: ${error.message}`);
            throw error;
        }
    }
    async syncAndProcessRecordings(organizationId, limit = 500, fromDate, toDate) {
        try {
            this.logger.log(`[SYNC] Starting Sipuni sync for org ${organizationId} with limit ${limit}...`);
            if (fromDate && toDate) {
                this.logger.log(`[SYNC] Date filter: ${fromDate} to ${toDate}`);
            }
            const records = await this.fetchAllRecords(organizationId, limit);
            await this.saveRecordsToCSV(records, organizationId);
            if (records.length === 0) {
                this.logger.log('[SYNC] No new records found');
                return {
                    success: true,
                    message: 'No new records found',
                    recordsProcessed: 0,
                };
            }
            let processed = 0;
            let skipped = 0;
            let failed = 0;
            let filteredRecords = records;
            if (fromDate && toDate) {
                const fromDateTime = this.parseSipuniDate(`${fromDate} 00:00:00`);
                const toDateTime = this.parseSipuniDate(`${toDate} 23:59:59`);
                filteredRecords = records.filter((record) => {
                    try {
                        const recordDate = this.parseSipuniDate(record.time);
                        return recordDate >= fromDateTime && recordDate <= toDateTime;
                    }
                    catch (error) {
                        this.logger.warn(`Failed to parse date for record: ${record.time}`);
                        return false;
                    }
                });
                this.logger.log(`[SYNC] Filtered ${filteredRecords.length} records from ${records.length} total (date range: ${fromDate} - ${toDate})`);
            }
            for (const record of filteredRecords) {
                try {
                    let extCode = record.from;
                    if (record.type === 'Входящий' &&
                        record.answered &&
                        !record.answered.startsWith('+')) {
                        extCode = record.answered;
                    }
                    const employee = await this.prisma.user.findFirst({
                        where: { extCode: extCode },
                    });
                    if (!employee) {
                        this.logger.warn(`[SYNC] Employee not found for extCode: ${extCode} (from: ${record.from}, answered: ${record.answered}, type: ${record.type}), skipping call ${record.recordId}`);
                        skipped++;
                        continue;
                    }
                    const externalId = record.recordId && record.recordId.trim() !== ''
                        ? record.recordId
                        : record.orderId && record.orderId.trim() !== ''
                            ? record.orderId
                            : `sipuni_${record.time}_${record.from}_${record.to}`.replace(/[:\s]/g, '_');
                    const existingCall = await this.prisma.call.findFirst({
                        where: {
                            organizationId: employee.organizationId,
                            externalId,
                        },
                    });
                    if (existingCall) {
                        this.logger.log(`[SYNC] Call ${externalId} already exists (status: ${existingCall.status}), skipping`);
                        skipped++;
                        continue;
                    }
                    const hasRecording = record.recordId && record.recordId.trim() !== '';
                    let audioFile = 'no-audio.mp3';
                    if (hasRecording) {
                        try {
                            const filename = `sipuni_${record.time.replace(/[:\s]/g, '_')}`;
                            audioFile = await this.downloadRecordingById(employee.organizationId, record.recordId, filename);
                        }
                        catch (downloadError) {
                            if (downloadError.message.includes('404') ||
                                downloadError.message.includes('not found')) {
                                this.logger.warn(`[SYNC] Recording not available for ${record.recordId}, skipping call creation`);
                                skipped++;
                                continue;
                            }
                            throw downloadError;
                        }
                    }
                    const callDate = this.parseSipuniDate(record.time);
                    const call = await this.prisma.call.create({
                        data: {
                            organizationId: employee.organizationId,
                            externalId,
                            employeeId: employee.id,
                            branchId: employee.branchId,
                            departmentId: employee.departmentId,
                            fileUrl: audioFile,
                            status: hasRecording ? 'UPLOADED' : 'DONE',
                            callerNumber: record.from,
                            calleeNumber: record.to,
                            callDate: callDate,
                            durationSec: parseInt(record.talkDuration) || 0,
                        },
                    });
                    this.logger.log(`[SYNC] Created call record ${call.id} for ${externalId} (hasRecording: ${hasRecording})`);
                    if (hasRecording) {
                        this.aiService.processCall(call.id).catch((error) => {
                            this.logger.error(`[SYNC] Background AI processing failed for ${call.id}: ${error.message}`);
                        });
                    }
                    else {
                        this.logger.log(`[SYNC] Skipping AI processing for unanswered call ${externalId}`);
                    }
                    processed++;
                    this.logger.log(`[SYNC] Processed ${processed}/${filteredRecords.length} records`);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
                catch (error) {
                    if (error.message &&
                        error.message.includes('Unique constraint failed')) {
                        this.logger.warn(`[SYNC] Skipping duplicate record ${record.recordId} - already exists in database`);
                        skipped++;
                    }
                    else {
                        this.logger.error(`[SYNC] Failed to process record ${record.recordId}: ${error.message}`);
                        failed++;
                    }
                }
            }
            const message = `Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`;
            this.logger.log(`[SYNC] ${message}`);
            return { success: true, message, recordsProcessed: processed };
        }
        catch (error) {
            this.logger.error(`[SYNC] Sync failed: ${error.message}`);
            return {
                success: false,
                message: `Sync failed: ${error.message}`,
                recordsProcessed: 0,
            };
        }
    }
    parseSipuniDate(dateStr) {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
    }
    async saveRecordsToCSV(records, organizationId) {
        try {
            const csvPath = path.join(process.cwd(), 'sipuni-all-records.csv');
            const header = 'Тип;Статус;Время;Схема;Откуда;Куда;Кто ответил;Длительность звонка, сек;Длительность разговора, сек;Время ответа, сек;Оценка;ID записи;Метка;Теги;ID заказа звонка;Запись существует;Новый клиент\n';
            const rows = records
                .map((r) => [
                r.type,
                r.status,
                r.time,
                r.tree,
                r.from,
                r.to,
                r.answered,
                r.duration,
                r.talkDuration,
                r.answerTime,
                r.rating,
                r.recordId,
                r.label,
                r.tags,
                r.orderId,
                r.recordExists,
                r.newClient,
            ].join(';'))
                .join('\n');
            fs.writeFileSync(csvPath, header + rows, 'utf-8');
            this.logger.log(`[CSV] Saved ${records.length} records to ${csvPath}`);
        }
        catch (error) {
            this.logger.error(`[CSV] Failed to save records: ${error.message}`);
        }
    }
    async updateCSVFromSipuni(organizationId) {
        this.logger.log(`[CSV-UPDATE] Fetching fresh data from Sipuni for org ${organizationId}...`);
        try {
            const records = await this.fetchAllRecords(organizationId, 1000);
            await this.saveRecordsToCSV(records, organizationId);
            this.logger.log(`[CSV-UPDATE] CSV updated with ${records.length} records`);
        }
        catch (error) {
            this.logger.error(`[CSV-UPDATE] Failed to update CSV: ${error.message}`);
        }
    }
    async updateEmployeesFromCSV(organizationId) {
        this.logger.log(`[EMPLOYEES-UPDATE] Updating employees from CSV for org ${organizationId}...`);
        try {
            const csvPath = path.join(process.cwd(), 'sipuni-all-records.csv');
            if (!fs.existsSync(csvPath)) {
                this.logger.warn(`[EMPLOYEES-UPDATE] CSV file not found: ${csvPath}`);
                return;
            }
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            const lines = csvContent.split('\n').filter((l) => l.trim());
            const records = lines.slice(1).map((line) => {
                const cols = line.split(';');
                return {
                    from: cols[4],
                    answered: cols[6],
                };
            });
            const extCodes = new Set();
            for (const record of records) {
                if (/^\d{3}$/.test(record.from)) {
                    extCodes.add(record.from);
                }
                if (/^\d{3}$/.test(record.answered)) {
                    extCodes.add(record.answered);
                }
            }
            const uniqueExtCodes = Array.from(extCodes).sort();
            this.logger.log(`[EMPLOYEES-UPDATE] Found ${uniqueExtCodes.length} unique extension codes`);
            let branch = await this.prisma.branch.findFirst({
                where: { organizationId, name: 'Main Branch' },
            });
            if (!branch) {
                branch = await this.prisma.branch.create({
                    data: {
                        organizationId,
                        name: 'Main Branch',
                        address: 'Navoi, Uzbekistan',
                    },
                });
            }
            let department = await this.prisma.department.findFirst({
                where: { branchId: branch.id, name: 'Call Center' },
            });
            if (!department) {
                department = await this.prisma.department.create({
                    data: {
                        branchId: branch.id,
                        name: 'Call Center',
                    },
                });
            }
            const bcrypt = await import('bcrypt');
            const passwordHash = await bcrypt.hash('password123', 10);
            const firstNames = [
                'Alisher',
                'Bobur',
                'Dilshod',
                'Eldor',
                'Farrux',
                'Gulnora',
                'Hasan',
                'Iroda',
                'Jasur',
                'Kamila',
            ];
            const lastNames = [
                'Navoiy',
                'Mirzo',
                'Qodirov',
                'Tursunov',
                'Usmonov',
                'Karimova',
                'Rashidov',
                'Sadikova',
                'Yusupov',
                'Azizova',
            ];
            let createdCount = 0;
            let updatedCount = 0;
            for (const [index, extCode] of uniqueExtCodes.entries()) {
                const firstName = firstNames[index % firstNames.length];
                const lastName = lastNames[index % lastNames.length];
                const phone = `+99890123${extCode}`;
                try {
                    const user = await this.prisma.user.upsert({
                        where: {
                            organizationId_phone: {
                                organizationId,
                                phone: phone,
                            },
                        },
                        update: {
                            extCode: extCode,
                        },
                        create: {
                            organizationId,
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            extCode: extCode,
                            role: 'EMPLOYEE',
                            passwordHash: passwordHash,
                            branchId: branch.id,
                            departmentId: department.id,
                        },
                    });
                    if (user.createdAt.getTime() === user.updatedAt.getTime()) {
                        createdCount++;
                    }
                    else {
                        updatedCount++;
                    }
                }
                catch (error) {
                    this.logger.warn(`[EMPLOYEES-UPDATE] Failed to upsert ext ${extCode}: ${error.message}`);
                }
            }
            this.logger.log(`[EMPLOYEES-UPDATE] Complete: ${createdCount} created, ${updatedCount} updated`);
        }
        catch (error) {
            this.logger.error(`[EMPLOYEES-UPDATE] Failed to update employees: ${error.message}`);
        }
    }
};
SipuniService = SipuniService_1 = __decorate([
    Injectable(),
    __param(3, Inject(forwardRef(() => AiService))),
    __metadata("design:paramtypes", [ConfigService,
        PrismaService,
        HttpService,
        AiService,
        SchedulerRegistry])
], SipuniService);
export { SipuniService };
//# sourceMappingURL=sipuni.service.js.map