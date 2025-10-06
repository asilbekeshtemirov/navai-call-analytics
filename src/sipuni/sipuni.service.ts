import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { SipuniExportDto } from './dto/sipuni-export.dto.js';
import { SipuniCallRecord } from './dto/sipuni-record.dto.js';

interface SipuniRecord {
    type: string;
    status: string;
    time: string;
    tree: string;
    from: string;
    to: string;
    answered: string;
    duration: string;
    talkDuration: string;
    answerTime: string;
    rating: string;
    recordId: string;
    label: string;
    tags: string;
    orderId: string;
    recordExists: string;
    newClient: string;
}

@Injectable()
export class SipuniService {
    private readonly logger = new Logger(SipuniService.name);
    private readonly saveDir = './recordings';
    private sipuniApiUrl: string;
    private sipuniApiKey: string;
    private sipuniUserId: string;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly http: HttpService,
        @Inject(forwardRef(() => AiService))
        private readonly aiService: AiService,
    ) {
        // Initialize with default values from .env (fallback)
        this.sipuniApiUrl = this.config.get<string>('SIPUNI_API_URL') || 'https://sipuni.com/api';
        this.sipuniApiKey = this.config.get<string>('SIPUNI_API_KEY') || '';
        this.sipuniUserId = this.config.get<string>('SIPUNI_USER_ID') || '';

        this.logger.log(`[INIT] Sipuni Service initialized (will use Settings for actual credentials)`);

        // Create recordings directory if it doesn't exist
        if (!fs.existsSync(this.saveDir)) {
            fs.mkdirSync(this.saveDir, { recursive: true });
        }
    }

    /**
     * Load Sipuni credentials from Settings (frontend can update)
     */
    private async loadSipuniCredentials(): Promise<{ apiUrl: string; apiKey: string; userId: string }> {
        const settings = await this.prisma.setting.findFirst();

        if (settings && settings.sipuniApiUrl && settings.sipuniApiKey && settings.sipuniUserId) {
            this.logger.log(`[CONFIG] Using Sipuni credentials from Settings`);
            return {
                apiUrl: settings.sipuniApiUrl,
                apiKey: settings.sipuniApiKey,
                userId: settings.sipuniUserId,
            };
        }

        // Fallback to .env values
        this.logger.log(`[CONFIG] Using Sipuni credentials from .env (fallback)`);
        return {
            apiUrl: this.sipuniApiUrl,
            apiKey: this.sipuniApiKey,
            userId: this.sipuniUserId,
        };
    }

    /**
     * Create hash string for Sipuni API authentication
     */
    private createHashString(exportDto: SipuniExportDto): string {
        const params = [
            exportDto.anonymous || '1', exportDto.crmLinks || '0', exportDto.dtmfUserAnswer || '0',
            exportDto.firstTime || '0', exportDto.from, exportDto.fromNumber || '',
            exportDto.hangupinitor || '1', exportDto.ignoreSpecChar || '1', exportDto.names || '0',
            exportDto.numbersInvolved || '0', exportDto.numbersRinged || '0', exportDto.outgoingLine || '1',
            exportDto.rating || '5', exportDto.showTreeId || '1', exportDto.state || '0',
            exportDto.timeFrom || '10:00', exportDto.timeTo || '20:00', exportDto.to,
            exportDto.toAnswer || '', exportDto.toNumber || '', exportDto.tree || '',
            exportDto.type || '0', exportDto.user || this.sipuniUserId, this.sipuniApiKey
        ];
        return params.join('+');
    }

    /**
     * Export statistics from Sipuni API (PHP style implementation)
     */
    async exportStatistics(exportDto: SipuniExportDto): Promise<string> {
        try {
            this.logger.log(`[EXPORT] Exporting statistics from ${exportDto.from} to ${exportDto.to}`);

            // Validate API key
            if (!this.sipuniApiKey || this.sipuniApiKey.length === 0) {
                throw new Error('SIPUNI_API_KEY is not configured');
            }

            // Create hash for authentication
            const hashString = this.createHashString(exportDto);
            this.logger.log(`[HASH] Hash string: ${hashString}`);

            const hash = crypto.createHash('md5').update(hashString).digest('hex');

            // Prepare request parameters
            const params = {
                ...exportDto,
                anonymous: exportDto.anonymous || '1', crmLinks: exportDto.crmLinks || '0',
                dtmfUserAnswer: exportDto.dtmfUserAnswer || '0', firstTime: exportDto.firstTime || '0',
                fromNumber: exportDto.fromNumber || '', hangupinitor: exportDto.hangupinitor || '1',
                ignoreSpecChar: exportDto.ignoreSpecChar || '1', names: exportDto.names || '0',
                numbersInvolved: exportDto.numbersInvolved || '0', numbersRinged: exportDto.numbersRinged || '0',
                outgoingLine: exportDto.outgoingLine || '1', rating: exportDto.rating || '5',
                showTreeId: exportDto.showTreeId || '1', state: exportDto.state || '0',
                timeFrom: exportDto.timeFrom || '10:00', timeTo: exportDto.timeTo || '20:00',
                toAnswer: exportDto.toAnswer || '', toNumber: exportDto.toNumber || '',
                tree: exportDto.tree || '', type: exportDto.type || '0',
                user: exportDto.user || this.sipuniUserId, hash
            };

            // Make POST request to Sipuni API
            const response = await this.http.axiosRef.post(
                `${this.sipuniApiUrl}/statistic/export`,
                new URLSearchParams(params).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000 }
            );

            const responseData = response.data;
            if (typeof responseData === 'string' && responseData.includes('<html>')) {
                throw new Error('Sipuni API returned HTML error page instead of CSV data');
            }

            this.logger.log(`[EXPORT] Successfully fetched ${responseData.split('\n').length - 1} records`);
            return responseData;
        } catch (error: any) {
            this.logger.error(`[EXPORT] Failed to export statistics: ${error.message}`);
            throw error;
        }
    }


    /**
     * Fetch call records from Sipuni API
     */
    async fetchCallRecords(from: string, to: string): Promise<SipuniCallRecord[]> {
        this.logger.log(`[FETCH] Fetching call records from ${from} to ${to}`);

        const csvData = await this.exportStatistics({ user: this.sipuniUserId, from, to, type: '0', state: '0' });
        const records = this.parseCsvToCallRecords(csvData);

        this.logger.log(`[FETCH] Found ${records.length} call records`);
        return records;
    }

    /**
     * Parse CSV data to call records
     */
    private parseCsvToCallRecords(csvData: string): SipuniCallRecord[] {
        if (csvData.includes('<html>')) {
            throw new Error('Sipuni API returned HTML error page instead of CSV data');
        }

        return csvData.split('\n')
            .slice(1) // Skip header
            .filter(line => line.trim())
            .map((line, i) => {
                const cols = line.split(',');
                return {
                    uid: cols[0] || `sipuni_${Date.now()}_${i}`,
                    client: cols[1] || '', caller: cols[2] || '', start: cols[3] || '',
                    duration: parseInt(cols[4]) || 0, record: cols[5] || '',
                    type: cols[6] || '', status: cols[7] || '',
                    user: cols[8] || '', user_name: cols[9] || ''
                };
            })
            .filter(record => record.record?.trim());
    }

    /**
     * Test connection and configuration
     */
    async testConnection(): Promise<{ apiUrl: string; hasApiKey: boolean; hasUserId: boolean; source: string }> {
        const credentials = await this.loadSipuniCredentials();
        const source = credentials.apiKey === this.sipuniApiKey ? '.env' : 'Settings';

        return {
            apiUrl: credentials.apiUrl,
            hasApiKey: !!credentials.apiKey && credentials.apiKey.length > 0,
            hasUserId: !!credentials.userId && credentials.userId.length > 0,
            source,
        };
    }

    /**
     * Manual sync for specific date range
     */
    async manualSync(from: string, to: string): Promise<{ success: boolean; message: string; recordsProcessed: number }> {
        try {
            this.logger.log(`[MANUAL] Manual sync requested from ${from} to ${to}`);

            const callRecords = await this.fetchCallRecords(from, to);
            const results = await Promise.allSettled(
                callRecords.map(record => this.processCallRecord(record))
            );

            const processedCount = results.filter(r => r.status === 'fulfilled').length;
            const message = `Successfully processed ${processedCount} out of ${callRecords.length} call records`;

            this.logger.log(`[MANUAL] ${message}`);
            return { success: true, message, recordsProcessed: processedCount };
        } catch (error: any) {
            this.logger.error(`[MANUAL] Manual sync failed: ${error.message}`);
            return { success: false, message: `Manual sync failed: ${error.message}`, recordsProcessed: 0 };
        }
    }

    /**
     * Process a single call record - Only download files
     */
    private async processCallRecord(record: SipuniCallRecord): Promise<void> {
        // Only download recording if available
        if (record.record?.startsWith('http')) {
            try {
                const audioFile = await this.downloadRecording(record.record, record.uid);
                this.logger.log(`[RECORD] Successfully downloaded recording for ${record.uid}: ${audioFile}`);
            } catch (error: any) {
                this.logger.warn(`[RECORD] Failed to download recording for ${record.uid}: ${error.message}`);
            }
        } else {
            this.logger.log(`[RECORD] No recording URL for ${record.uid}`);
        }
    }

    private async downloadRecording(url: string, uid: string): Promise<string> {
        const filepath = path.join(this.saveDir, `${uid}.mp3`);

        // Check if file already exists
        if (fs.existsSync(filepath)) {
            this.logger.log(`[DOWNLOAD] File already exists: ${filepath}`);
            return filepath;
        }

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            https.get(url, (response) => {
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
            }).on('error', reject);
        });
    }


    private async transcribeAudio(audioFile: string): Promise<string> {
        // TODO: Integrate with STT service
        return '';
    }

    /**
     * Fetch ALL records using /export/all API endpoint
     */
    async fetchAllRecords(limit: number = 500, order: string = 'desc', page: number = 1): Promise<SipuniRecord[]> {
        this.logger.log(`[FETCH_ALL] Fetching records (limit: ${limit}, order: ${order}, page: ${page})`);

        try {
            // Load credentials from Settings
            const credentials = await this.loadSipuniCredentials();

            // Create hash: limit + order + page + user + secret
            const hashString = [limit, order, page, credentials.userId, credentials.apiKey].join('+');
            const hash = crypto.createHash('md5').update(hashString).digest('hex');

            this.logger.log(`[HASH] Hash calculated (using ${credentials.apiKey === this.sipuniApiKey ? '.env' : 'Settings'} credentials)`);

            const response = await axios.post(
                `${credentials.apiUrl}/statistic/export/all`,
                new URLSearchParams({ limit: limit.toString(), order, page: page.toString(), user: credentials.userId, hash }).toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 30000
                }
            );

            const csvData = response.data;
            const lines = csvData.split('\n').filter((l: string) => l.trim());

            this.logger.log(`[FETCH_ALL] Fetched ${lines.length - 1} records`);

            // Parse CSV to records
            const records: SipuniRecord[] = lines.slice(1).map((line: string) => {
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
                    newClient: cols[16]
                };
            });

            // Return all records (both answered and unanswered)
            // Answered calls will have recordId for audio processing
            this.logger.log(`[FETCH_ALL] Found ${records.length} calls total`);

            const withRecording = records.filter(r => r.recordId && r.recordId.trim() !== '');
            const withoutRecording = records.length - withRecording.length;
            this.logger.log(`[FETCH_ALL] ${withRecording.length} with recording, ${withoutRecording} without recording`);

            return records;
        } catch (error: any) {
            this.logger.error(`[FETCH_ALL] Failed to fetch records: ${error.message}`);
            throw error;
        }
    }

    /**
     * Download recording by recordId using /statistic/record API
     */
    async downloadRecordingById(recordId: string, filename: string): Promise<string> {
        const filepath = path.join(this.saveDir, `${filename}.mp3`);

        // Check if file already exists
        if (fs.existsSync(filepath)) {
            this.logger.log(`[DOWNLOAD] File already exists: ${filepath}`);
            return filepath;
        }

        try {
            // Load credentials from Settings
            const credentials = await this.loadSipuniCredentials();

            // Create hash: id + user + secret
            const hashString = [recordId, credentials.userId, credentials.apiKey].join('+');
            const hash = crypto.createHash('md5').update(hashString).digest('hex');

            const response = await axios.post(
                `${credentials.apiUrl}/statistic/record`,
                new URLSearchParams({ id: recordId, user: credentials.userId, hash }).toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    responseType: 'arraybuffer',
                    timeout: 60000
                }
            );

            fs.writeFileSync(filepath, response.data);
            const sizeKB = Math.round(response.data.length / 1024);
            this.logger.log(`[DOWNLOAD] Downloaded ${sizeKB} KB to ${filepath}`);
            return filepath;
        } catch (error: any) {
            this.logger.error(`[DOWNLOAD] Failed to download ${recordId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Sync and process Sipuni recordings
     */
    async syncAndProcessRecordings(limit: number = 500): Promise<{ success: boolean; message: string; recordsProcessed: number }> {
        try {
            this.logger.log(`[SYNC] Starting Sipuni sync with limit ${limit}...`);

            // Step 1: Fetch all records
            const records = await this.fetchAllRecords(limit);

            if (records.length === 0) {
                this.logger.log('[SYNC] No new records found');
                return { success: true, message: 'No new records found', recordsProcessed: 0 };
            }

            let processed = 0;
            let skipped = 0;
            let failed = 0;

            // Step 2: Process each record
            for (const record of records) {
                try {
                    // Create unique externalId - use recordId if available, otherwise orderId or generated ID
                    const externalId = record.recordId && record.recordId.trim() !== ''
                        ? record.recordId
                        : (record.orderId && record.orderId.trim() !== ''
                            ? record.orderId
                            : `sipuni_${record.time}_${record.from}_${record.to}`.replace(/[:\s]/g, '_'));

                    // Check if call already exists in DB
                    const existingCall = await this.prisma.call.findUnique({
                        where: { externalId }
                    });

                    if (existingCall) {
                        this.logger.log(`[SYNC] Call ${externalId} already exists (status: ${existingCall.status}), skipping`);
                        skipped++;
                        continue;
                    }

                    // Check if this call has audio recording
                    const hasRecording = record.recordId && record.recordId.trim() !== '';

                    // Download recording if available
                    let audioFile = 'no-audio.mp3'; // Default for unanswered calls
                    if (hasRecording) {
                        const filename = `sipuni_${record.time.replace(/[:\s]/g, '_')}`;
                        audioFile = await this.downloadRecordingById(record.recordId, filename);
                    }

                    // Parse call date
                    const callDate = this.parseSipuniDate(record.time);

                    // Find employee by ext code
                    // For outgoing calls: use FROM field (extension)
                    // For incoming calls: use answered field or FROM
                    let extCode = record.from; // Default to FROM (extension for outgoing)

                    // If call type is incoming (Входящий), answered field might have extension
                    if (record.type === 'Входящий' && record.answered && !record.answered.startsWith('+')) {
                        extCode = record.answered;
                    }

                    const employee = await this.prisma.user.findFirst({
                        where: { extCode: extCode }
                    });

                    if (!employee) {
                        this.logger.warn(`[SYNC] Employee not found for extCode: ${extCode} (from: ${record.from}, answered: ${record.answered}, type: ${record.type}), skipping call ${record.recordId}`);
                        // Delete downloaded file
                        if (fs.existsSync(audioFile)) {
                            fs.unlinkSync(audioFile);
                        }
                        skipped++;
                        continue;
                    }

                    // Create call record in DB
                    const call = await this.prisma.call.create({
                        data: {
                            externalId,
                            employeeId: employee.id,
                            branchId: employee.branchId,
                            departmentId: employee.departmentId,
                            fileUrl: audioFile,
                            status: hasRecording ? 'UPLOADED' : 'DONE', // No processing needed for unanswered calls
                            callerNumber: record.from,
                            calleeNumber: record.to,
                            callDate: callDate,
                            durationSec: parseInt(record.talkDuration) || 0,
                        }
                    });

                    this.logger.log(`[SYNC] Created call record ${call.id} for ${externalId} (hasRecording: ${hasRecording})`);

                    // Process call through AI pipeline only if it has recording
                    if (hasRecording) {
                        await this.aiService.processCall(call.id);
                    } else {
                        this.logger.log(`[SYNC] Skipping AI processing for unanswered call ${externalId}`);
                    }

                    processed++;
                    this.logger.log(`[SYNC] Processed ${processed}/${records.length} records`);

                    // Small delay to avoid overwhelming APIs
                    await new Promise(resolve => setTimeout(resolve, 2000));

                } catch (error: any) {
                    this.logger.error(`[SYNC] Failed to process record ${record.recordId}: ${error.message}`);
                    failed++;
                }
            }

            const message = `Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`;
            this.logger.log(`[SYNC] ${message}`);

            return { success: true, message, recordsProcessed: processed };
        } catch (error: any) {
            this.logger.error(`[SYNC] Sync failed: ${error.message}`);
            return { success: false, message: `Sync failed: ${error.message}`, recordsProcessed: 0 };
        }
    }

    /**
     * Parse Sipuni date format (DD.MM.YYYY HH:mm:ss) to Date object
     */
    private parseSipuniDate(dateStr: string): Date {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');

        return new Date(
            parseInt(year),
            parseInt(month) - 1, // Month is 0-indexed
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
        );
    }

    /**
     * Daily scheduled job to sync Sipuni data at 23:50
     */
    @Cron('50 23 * * *')
    async dailySipuniSync() {
        try {
            this.logger.log('[CRON] Starting daily Sipuni sync...');
            await this.syncAndProcessRecordings(500);
            this.logger.log('[CRON] Daily Sipuni sync completed successfully');
        } catch (error: any) {
            this.logger.error(`[CRON] Daily Sipuni sync failed: ${error.message}`);
        }
    }
}
