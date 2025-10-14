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
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignStatus, CampaignCallStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { AutoCallingGateway } from './auto-calling.gateway.js';
let AutoCallingService = AutoCallingService_1 = class AutoCallingService {
    prisma;
    gateway;
    logger = new Logger(AutoCallingService_1.name);
    activeCampaigns = new Map();
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
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
        return this.prisma.autoCallContact.create({
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
        return this.prisma.autoCallContact.update({
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
    }
    async deleteContact(organizationId, id) {
        const contact = await this.findContactById(organizationId, id);
        await this.prisma.autoCallContact.delete({ where: { id: contact.id } });
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
        return this.getCampaignById(organizationId, campaign.id);
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
        return this.getCampaignById(organizationId, campaign.id);
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
            const callResult = await this.makeCall(campaignContact.contact);
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
    async makeCall(contact) {
        await this.delay(3000);
        const outcomes = [
            {
                status: CampaignCallStatus.SUCCESS,
                outcome: 'Customer answered and agreed to payment plan',
                summary: 'Contact was cooperative and promised to pay within 7 days',
            },
            {
                status: CampaignCallStatus.NO_ANSWER,
                outcome: 'No answer',
                summary: 'Contact did not pick up the phone',
            },
            {
                status: CampaignCallStatus.PROMISE_TO_PAY,
                outcome: 'Promised to pay tomorrow',
                summary: 'Contact acknowledged debt and will pay by tomorrow',
            },
            {
                status: CampaignCallStatus.REFUSED,
                outcome: 'Refused to cooperate',
                summary: 'Contact hung up immediately',
            },
        ];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        return {
            ...result,
            duration: Math.floor(Math.random() * 300) + 30,
            recordingUrl: undefined,
        };
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
};
AutoCallingService = AutoCallingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AutoCallingGateway])
], AutoCallingService);
export { AutoCallingService };
//# sourceMappingURL=auto-calling.service.js.map