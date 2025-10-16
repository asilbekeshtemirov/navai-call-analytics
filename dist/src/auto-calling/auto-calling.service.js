var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutoCallingService_1;
import { Injectable, NotFoundException, BadRequestException, Logger, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignStatus, CampaignCallStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import { AutoCallingGateway } from './auto-calling.gateway.js';
import { TwilioService } from './twilio.service.js';
let AutoCallingService = AutoCallingService_1 = class AutoCallingService {
    prisma;
    gateway;
    twilioService;
    configService;
    logger = new Logger(AutoCallingService_1.name);
    activeCampaigns = new Map();
    callSids = new Map();
    constructor(prisma, gateway, twilioService, configService) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.twilioService = twilioService;
        this.configService = configService;
    }
    async createContact(organizationId, dto) {
        const existing = await this.prisma.autoCallContact.findUnique({
            where: {
                organizationId_phone: {
                    organizationId,
                    phone: dto.phone,
                },
            },
        });
        if (existing) {
            throw new BadRequestException('Contact with this phone already exists');
        }
        const contact = await this.prisma.autoCallContact.create({
            data: {
                organizationId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                customData: dto.customData,
                notes: dto.notes,
            },
        });
        this.gateway.emitContactUpdate(organizationId, contact.id, {
            action: 'created',
            contact,
        });
        return contact;
    }
    async findAllContacts(organizationId, page = 1, limit = 50, status) {
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (status) {
            where.status = status;
        }
        const [contacts, total] = await Promise.all([
            this.prisma.autoCallContact.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.autoCallContact.count({ where }),
        ]);
        return {
            data: contacts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findContactById(organizationId, id) {
        const contact = await this.prisma.autoCallContact.findFirst({
            where: { id, organizationId },
            include: {
                campaignContacts: {
                    include: {
                        campaign: true,
                    },
                },
            },
        });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }
        return contact;
    }
    async updateContact(organizationId, id, dto) {
        const contact = await this.findContactById(organizationId, id);
        const updatedContact = await this.prisma.autoCallContact.update({
            where: { id: contact.id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                customData: dto.customData,
                notes: dto.notes,
                status: dto.status,
                lastConversationOutcome: dto.lastConversationOutcome,
                currentConversationOutcome: dto.currentConversationOutcome,
            },
        });
        this.gateway.emitContactUpdate(organizationId, updatedContact.id, {
            action: 'updated',
            contact: updatedContact,
        });
        return updatedContact;
    }
    async deleteContact(organizationId, id) {
        const contact = await this.findContactById(organizationId, id);
        await this.prisma.autoCallContact.delete({ where: { id: contact.id } });
        this.gateway.emitContactUpdate(organizationId, id, {
            action: 'deleted',
            contactId: id,
        });
        return { message: 'Contact deleted successfully' };
    }
    async createCampaign(organizationId, dto) {
        const campaign = await this.prisma.autoCallCampaign.create({
            data: {
                organizationId,
                name: dto.name,
                description: dto.description,
                campaignType: dto.campaignType,
            },
        });
        if (dto.contactIds && dto.contactIds.length > 0) {
            await this.addContactsToCampaign(organizationId, campaign.id, dto.contactIds);
        }
        const result = await this.getCampaignById(organizationId, campaign.id);
        this.gateway.emitCampaignUpdate(organizationId, {
            action: 'created',
            campaignId: campaign.id,
            campaign: result,
        });
        return result;
    }
    async addContactsToCampaign(organizationId, campaignId, contactIds) {
        const campaign = await this.getCampaignById(organizationId, campaignId);
        const contacts = await this.prisma.autoCallContact.findMany({
            where: {
                id: { in: contactIds },
                organizationId,
            },
        });
        if (contacts.length !== contactIds.length) {
            throw new BadRequestException('Some contacts not found or do not belong to your organization');
        }
        await this.prisma.autoCallCampaignContact.createMany({
            data: contacts.map((contact) => ({
                campaignId: campaign.id,
                contactId: contact.id,
            })),
            skipDuplicates: true,
        });
        const totalContacts = await this.prisma.autoCallCampaignContact.count({
            where: { campaignId: campaign.id },
        });
        await this.prisma.autoCallCampaign.update({
            where: { id: campaign.id },
            data: { totalContacts },
        });
        const result = await this.getCampaignById(organizationId, campaign.id);
        this.gateway.emitCampaignUpdate(organizationId, {
            action: 'contacts-added',
            campaignId: campaign.id,
            campaign: result,
            addedContactIds: contactIds,
        });
        return result;
    }
    async getCampaignById(organizationId, id) {
        const campaign = await this.prisma.autoCallCampaign.findFirst({
            where: { id, organizationId },
            include: {
                campaignContacts: {
                    include: {
                        contact: true,
                    },
                },
            },
        });
        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }
        return campaign;
    }
    async findAllCampaigns(organizationId, page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (status) {
            where.status = status;
        }
        const [campaigns, total] = await Promise.all([
            this.prisma.autoCallCampaign.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { campaignContacts: true },
                    },
                },
            }),
            this.prisma.autoCallCampaign.count({ where }),
        ]);
        return {
            data: campaigns,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async deleteCampaign(organizationId, id) {
        const campaign = await this.getCampaignById(organizationId, id);
        if (campaign.status === CampaignStatus.RUNNING) {
            throw new BadRequestException('Cannot delete a running campaign. Stop it first.');
        }
        await this.prisma.autoCallCampaign.delete({ where: { id: campaign.id } });
        this.gateway.emitCampaignUpdate(organizationId, {
            action: 'deleted',
            campaignId: id,
        });
        return { message: 'Campaign deleted successfully' };
    }
    async parseExcelAndCreateContacts(organizationId, file) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new BadRequestException('Excel file is empty');
        }
        const contacts = [];
        const errors = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            try {
                const firstName = row.getCell(1).value?.toString().trim();
                const lastName = row.getCell(2).value?.toString().trim();
                const phone = row.getCell(3).value?.toString().trim();
                const dateOfBirth = row.getCell(4).value?.toString().trim();
                const customDataStr = row.getCell(5).value?.toString().trim();
                const notes = row.getCell(6).value?.toString().trim();
                if (!firstName || !lastName || !phone) {
                    errors.push(`Row ${rowNumber}: Missing required fields`);
                    return;
                }
                let customData;
                if (customDataStr) {
                    try {
                        customData = JSON.parse(customDataStr);
                    }
                    catch (e) {
                        this.logger.warn(`Row ${rowNumber}: Invalid JSON in customData, skipping`);
                    }
                }
                contacts.push({
                    firstName,
                    lastName,
                    phone,
                    dateOfBirth: dateOfBirth || undefined,
                    customData,
                    notes: notes || undefined,
                });
            }
            catch (error) {
                errors.push(`Row ${rowNumber}: ${error.message}`);
            }
        });
        const created = [];
        const failed = [];
        for (const contactDto of contacts) {
            try {
                const contact = await this.createContact(organizationId, contactDto);
                created.push(contact);
            }
            catch (error) {
                failed.push({ contact: contactDto, error: error.message });
            }
        }
        return {
            success: created.length,
            failed: failed.length,
            errors,
            created,
            failedContacts: failed,
        };
    }
    async startCampaign(organizationId, campaignId) {
        const campaign = await this.getCampaignById(organizationId, campaignId);
        if (campaign.status === CampaignStatus.RUNNING) {
            throw new BadRequestException('Campaign is already running');
        }
        if (campaign.totalContacts === 0) {
            throw new BadRequestException('Campaign has no contacts');
        }
        await this.prisma.autoCallCampaign.update({
            where: { id: campaign.id },
            data: {
                status: CampaignStatus.RUNNING,
                startedAt: new Date(),
            },
        });
        this.activeCampaigns.set(campaignId, true);
        this.gateway.emitCampaignUpdate(organizationId, {
            action: 'started',
            campaignId,
            status: CampaignStatus.RUNNING,
        });
        this.processCampaignCalls(organizationId, campaignId).catch((error) => {
            this.logger.error(`Campaign ${campaignId} failed:`, error);
        });
        return { message: 'Campaign started successfully', campaignId };
    }
    async stopCampaign(organizationId, campaignId) {
        const campaign = await this.getCampaignById(organizationId, campaignId);
        if (campaign.status !== CampaignStatus.RUNNING) {
            throw new BadRequestException('Campaign is not running');
        }
        this.activeCampaigns.set(campaignId, false);
        await this.prisma.autoCallCampaign.update({
            where: { id: campaign.id },
            data: {
                status: CampaignStatus.PAUSED,
            },
        });
        this.gateway.emitCampaignUpdate(organizationId, {
            action: 'stopped',
            campaignId,
            status: CampaignStatus.PAUSED,
        });
        return { message: 'Campaign stopped successfully' };
    }
    async processCampaignCalls(organizationId, campaignId) {
        this.logger.log(`Starting campaign ${campaignId}`);
        const campaignContacts = await this.prisma.autoCallCampaignContact.findMany({
            where: {
                campaignId,
                callStatus: CampaignCallStatus.PENDING,
            },
            include: {
                contact: true,
            },
        });
        for (const campaignContact of campaignContacts) {
            if (!this.activeCampaigns.get(campaignId)) {
                this.logger.log(`Campaign ${campaignId} stopped by user`);
                break;
            }
            await this.prisma.autoCallCampaignContact.update({
                where: { id: campaignContact.id },
                data: { callStatus: CampaignCallStatus.CALLING },
            });
            this.gateway.emitCampaignUpdate(organizationId, {
                campaignId,
                contactId: campaignContact.contactId,
                status: 'calling',
                contact: campaignContact.contact,
            });
            const callResult = await this.makeCall(campaignContact.contact, campaignContact.id);
            await this.prisma.autoCallCampaignContact.update({
                where: { id: campaignContact.id },
                data: {
                    callStatus: callResult.status,
                    conversationOutcome: callResult.outcome,
                    conversationSummary: callResult.summary,
                    callDuration: callResult.duration,
                    recordingUrl: callResult.recordingUrl,
                    lastCallDate: new Date(),
                    callAttempts: { increment: 1 },
                },
            });
            await this.prisma.autoCallContact.update({
                where: { id: campaignContact.contactId },
                data: {
                    isCalled: true,
                    lastConversationDate: new Date(),
                    lastConversationOutcome: callResult.outcome,
                    currentConversationOutcome: callResult.outcome,
                    lastContactDate: new Date(),
                },
            });
            const stats = await this.calculateCampaignStats(campaignId);
            await this.prisma.autoCallCampaign.update({
                where: { id: campaignId },
                data: {
                    calledContacts: stats.called,
                    successfulCalls: stats.success,
                    failedCalls: stats.failed,
                },
            });
            this.gateway.emitCampaignUpdate(organizationId, {
                campaignId,
                contactId: campaignContact.contactId,
                status: callResult.status,
                contact: campaignContact.contact,
                outcome: callResult.outcome,
                summary: callResult.summary,
            });
            await this.delay(2000);
        }
        if (this.activeCampaigns.get(campaignId)) {
            await this.prisma.autoCallCampaign.update({
                where: { id: campaignId },
                data: {
                    status: CampaignStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            this.gateway.emitCampaignComplete(organizationId, campaignId);
        }
        this.activeCampaigns.delete(campaignId);
        this.logger.log(`Campaign ${campaignId} completed`);
    }
    async makeCall(contact, campaignContactId) {
        this.logger.log('═══════════════════════════════════════');
        this.logger.log(`📞 Starting call to: ${contact.firstName} ${contact.lastName}`);
        this.logger.log(`📱 Phone: ${contact.phone}`);
        if (contact.customData?.remaining_debt) {
            this.logger.log(`💰 Debt: ${contact.customData.remaining_debt} so'm`);
        }
        this.logger.log('═══════════════════════════════════════');
        if (this.twilioService.isConfigured()) {
            this.logger.log('🌐 [REAL MODE] Using Twilio for real phone call');
            return this.makeRealCall(contact, campaignContactId);
        }
        else {
            this.logger.warn('⚙️  [SIMULATION MODE] Twilio not configured - Using enhanced simulation');
            return this.simulateCall();
        }
    }
    async makeRealCall(contact, campaignContactId) {
        try {
            const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:4000';
            const script = this.generateCallScript(contact);
            const twimlUrl = `${baseUrl}/auto-calling/twilio/twiml?contactId=${contact.id}`;
            this.logger.log(`Making real call to ${contact.phone}`);
            const callResult = await this.twilioService.makeCall(contact.phone, twimlUrl);
            if (!callResult.success) {
                return {
                    status: CampaignCallStatus.FAILED,
                    outcome: 'Call failed',
                    summary: callResult.error || 'Unknown error',
                    duration: 0,
                };
            }
            if (campaignContactId && callResult.callSid) {
                this.callSids.set(campaignContactId, callResult.callSid);
            }
            await this.delay(5000);
            if (callResult.callSid) {
                const callDetails = await this.twilioService.getCallDetails(callResult.callSid);
                if (callDetails) {
                    const recordings = await this.twilioService.getCallRecordings(callResult.callSid);
                    return {
                        status: this.mapTwilioStatusToCampaignStatus(callDetails.status),
                        outcome: this.getOutcomeFromCallStatus(callDetails.status),
                        summary: `Call ${callDetails.status}. Duration: ${callDetails.duration}s`,
                        duration: callDetails.duration || 0,
                        recordingUrl: recordings.length > 0 ? recordings[0] : undefined,
                    };
                }
            }
            return {
                status: CampaignCallStatus.SUCCESS,
                outcome: 'Call initiated',
                summary: 'Call has been placed. Status pending.',
                duration: 0,
            };
        }
        catch (error) {
            this.logger.error('Error making real call:', error);
            return {
                status: CampaignCallStatus.FAILED,
                outcome: 'Call failed',
                summary: error.message,
                duration: 0,
            };
        }
    }
    async simulateCall() {
        this.logger.log('📞 [SIMULATION] Initiating call...');
        await this.delay(1000 + Math.random() * 1000);
        this.logger.log('📞 [SIMULATION] Dialing number...');
        const ringingTime = 2000 + Math.random() * 3000;
        await this.delay(ringingTime);
        this.logger.log('📞 [SIMULATION] Phone is ringing...');
        const outcomes = [
            {
                status: CampaignCallStatus.SUCCESS,
                outcome: 'Customer answered and agreed to payment plan',
                summary: 'Contact was cooperative and promised to pay within 7 days',
                probability: 0.25,
                conversationTime: 120000,
            },
            {
                status: CampaignCallStatus.NO_ANSWER,
                outcome: 'No answer',
                summary: 'Contact did not pick up the phone',
                probability: 0.35,
                conversationTime: 0,
            },
            {
                status: CampaignCallStatus.PROMISE_TO_PAY,
                outcome: 'Promised to pay tomorrow',
                summary: 'Contact acknowledged debt and will pay by tomorrow',
                probability: 0.25,
                conversationTime: 90000,
            },
            {
                status: CampaignCallStatus.REFUSED,
                outcome: 'Refused to cooperate',
                summary: 'Contact hung up immediately',
                probability: 0.15,
                conversationTime: 15000,
            },
        ];
        const rand = Math.random();
        let cumulative = 0;
        let selectedOutcome = outcomes[0];
        for (const outcome of outcomes) {
            cumulative += outcome.probability;
            if (rand <= cumulative) {
                selectedOutcome = outcome;
                break;
            }
        }
        if (selectedOutcome.status === CampaignCallStatus.NO_ANSWER) {
            this.logger.warn('⚠️  [SIMULATION] No answer - call timeout');
        }
        else {
            this.logger.log('✅ [SIMULATION] Call connected!');
            if (selectedOutcome.conversationTime > 0) {
                const steps = Math.floor(selectedOutcome.conversationTime / 5000);
                for (let i = 0; i < steps; i++) {
                    await this.delay(5000);
                    this.logger.log(`💬 [SIMULATION] Conversation in progress... (${(i + 1) * 5}s)`);
                }
            }
            this.logger.log(`✅ [SIMULATION] Call completed: ${selectedOutcome.outcome}`);
        }
        const baseDuration = selectedOutcome.conversationTime / 1000;
        const duration = Math.floor(baseDuration + (Math.random() * 30 - 15));
        return {
            status: selectedOutcome.status,
            outcome: selectedOutcome.outcome,
            summary: selectedOutcome.summary,
            duration: Math.max(0, duration),
            recordingUrl: undefined,
        };
    }
    generateCallScript(contact) {
        const firstName = contact.firstName || 'Mijoz';
        const debt = contact.customData?.remaining_debt || contact.customData?.total_debt;
        let script = `Assalomu alaykum, ${firstName}. `;
        script += `Bu avtomatik qo'ng'iroq. `;
        if (debt) {
            script += `Sizning qarzingiz ${debt} so'm. `;
            script += `Iltimos, qarzni to'lash uchun bizga murojaat qiling. `;
        }
        else {
            script += `Sizga muhim xabar bor. Iltimos, bizga qayta qo'ng'iroq qiling. `;
        }
        script += `Rahmat!`;
        return script;
    }
    mapTwilioStatusToCampaignStatus(twilioStatus) {
        const statusMap = {
            'completed': CampaignCallStatus.SUCCESS,
            'answered': CampaignCallStatus.SUCCESS,
            'busy': CampaignCallStatus.FAILED,
            'no-answer': CampaignCallStatus.NO_ANSWER,
            'failed': CampaignCallStatus.FAILED,
            'canceled': CampaignCallStatus.FAILED,
        };
        return statusMap[twilioStatus] || CampaignCallStatus.FAILED;
    }
    getOutcomeFromCallStatus(status) {
        const outcomes = {
            'completed': 'Call completed successfully',
            'answered': 'Customer answered',
            'busy': 'Line was busy',
            'no-answer': 'No answer',
            'failed': 'Call failed',
            'canceled': 'Call was canceled',
        };
        return outcomes[status] || 'Unknown status';
    }
    async calculateCampaignStats(campaignId) {
        const contacts = await this.prisma.autoCallCampaignContact.findMany({
            where: { campaignId },
        });
        const called = contacts.filter((c) => c.callStatus !== CampaignCallStatus.PENDING).length;
        const success = contacts.filter((c) => [CampaignCallStatus.SUCCESS, CampaignCallStatus.PROMISE_TO_PAY].includes(c.callStatus)).length;
        const failed = contacts.filter((c) => [CampaignCallStatus.FAILED, CampaignCallStatus.REFUSED, CampaignCallStatus.NO_ANSWER].includes(c.callStatus)).length;
        return { called, success, failed };
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async generateTwiMLForContact(contactId) {
        const contact = await this.prisma.autoCallContact.findUnique({
            where: { id: contactId },
        });
        if (!contact) {
            const twiml = this.twilioService.generateTwiML('Kechirasiz, kontakt topilmadi.', 'uz-UZ', 'Polly.Zehra');
            return { twiml };
        }
        const script = this.generateCallScript(contact);
        const twiml = this.twilioService.generateTwiML(script, 'uz-UZ', 'Polly.Zehra');
        this.logger.log(`Generated TwiML for contact ${contactId}`);
        return {
            twiml,
            contentType: 'application/xml',
        };
    }
    async handleTwilioCallStatus(body) {
        this.logger.log('Twilio call status update:', body);
        const { CallSid, CallStatus, CallDuration, To } = body;
        const contact = await this.prisma.autoCallContact.findFirst({
            where: { phone: To },
        });
        if (contact) {
            await this.prisma.autoCallContact.update({
                where: { id: contact.id },
                data: {
                    lastConversationDate: new Date(),
                    lastConversationOutcome: CallStatus,
                },
            });
            const campaignContact = await this.prisma.autoCallCampaignContact.findFirst({
                where: { contactId: contact.id },
                orderBy: { createdAt: 'desc' },
            });
            if (campaignContact) {
                await this.prisma.autoCallCampaignContact.update({
                    where: { id: campaignContact.id },
                    data: {
                        callStatus: this.mapTwilioStatusToCampaignStatus(CallStatus),
                        callDuration: CallDuration ? parseInt(CallDuration) : null,
                        conversationOutcome: CallStatus,
                    },
                });
            }
        }
        return { success: true };
    }
    async handleTwilioRecording(body) {
        this.logger.log('Twilio recording webhook:', body);
        const { CallSid, RecordingUrl } = body;
        return { success: true };
    }
    async handleUserResponse(body) {
        this.logger.log('User response:', body);
        const { SpeechResult, Digits, CallSid } = body;
        const twiml = this.twilioService.generateTwiML('Rahmat! Javobingiz qabul qilindi. Xayr!', 'uz-UZ', 'Polly.Zehra');
        return { twiml };
    }
};
AutoCallingService = AutoCallingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AutoCallingGateway,
        TwilioService,
        ConfigService])
], AutoCallingService);
export { AutoCallingService };
//# sourceMappingURL=auto-calling.service.js.map