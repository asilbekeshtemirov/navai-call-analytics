import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { CampaignStatus, CampaignCallStatus, ContactStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { AutoCallingGateway } from './auto-calling.gateway.js';

@Injectable()
export class AutoCallingService {
  private readonly logger = new Logger(AutoCallingService.name);
  private activeCampaigns: Map<string, boolean> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AutoCallingGateway,
  ) {}

  // ========== CONTACTS CRUD ==========
  async createContact(organizationId: number, dto: CreateContactDto) {
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

  async findAllContacts(
    organizationId: number,
    page: number = 1,
    limit: number = 50,
    status?: ContactStatus,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
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

  async findContactById(organizationId: number, id: string) {
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

  async updateContact(organizationId: number, id: string, dto: UpdateContactDto) {
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

  async deleteContact(organizationId: number, id: string) {
    const contact = await this.findContactById(organizationId, id);
    await this.prisma.autoCallContact.delete({ where: { id: contact.id } });
    return { message: 'Contact deleted successfully' };
  }

  // ========== CAMPAIGNS CRUD ==========
  async createCampaign(organizationId: number, dto: CreateCampaignDto) {
    const campaign = await this.prisma.autoCallCampaign.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        campaignType: dto.campaignType,
      },
    });

    // Add contacts to campaign if provided
    if (dto.contactIds && dto.contactIds.length > 0) {
      await this.addContactsToCampaign(organizationId, campaign.id, dto.contactIds);
    }

    return this.getCampaignById(organizationId, campaign.id);
  }

  async addContactsToCampaign(
    organizationId: number,
    campaignId: string,
    contactIds: string[],
  ) {
    const campaign = await this.getCampaignById(organizationId, campaignId);

    // Verify all contacts exist and belong to organization
    const contacts = await this.prisma.autoCallContact.findMany({
      where: {
        id: { in: contactIds },
        organizationId,
      },
    });

    if (contacts.length !== contactIds.length) {
      throw new BadRequestException('Some contacts not found or do not belong to your organization');
    }

    // Create campaign contacts
    await this.prisma.autoCallCampaignContact.createMany({
      data: contacts.map((contact) => ({
        campaignId: campaign.id,
        contactId: contact.id,
      })),
      skipDuplicates: true,
    });

    // Update campaign totals
    const totalContacts = await this.prisma.autoCallCampaignContact.count({
      where: { campaignId: campaign.id },
    });

    await this.prisma.autoCallCampaign.update({
      where: { id: campaign.id },
      data: { totalContacts },
    });

    return this.getCampaignById(organizationId, campaign.id);
  }

  async getCampaignById(organizationId: number, id: string) {
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

  async findAllCampaigns(
    organizationId: number,
    page: number = 1,
    limit: number = 20,
    status?: CampaignStatus,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
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

  async deleteCampaign(organizationId: number, id: string) {
    const campaign = await this.getCampaignById(organizationId, id);

    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running campaign. Stop it first.');
    }

    await this.prisma.autoCallCampaign.delete({ where: { id: campaign.id } });
    return { message: 'Campaign deleted successfully' };
  }

  // ========== EXCEL UPLOAD ==========
  async parseExcelAndCreateContacts(
    organizationId: number,
    file: Express.Multer.File,
  ) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Excel file is empty');
    }

    const contacts: CreateContactDto[] = [];
    const errors: string[] = [];

    // Expected headers: firstName, lastName, phone, dateOfBirth, customData (JSON string), notes
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

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
          } catch (e) {
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
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    });

    // Create contacts
    const created: any[] = [];
    const failed: any[] = [];

    for (const contactDto of contacts) {
      try {
        const contact = await this.createContact(organizationId, contactDto);
        created.push(contact);
      } catch (error) {
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

  // ========== AUTO-CALLING LOGIC ==========
  async startCampaign(organizationId: number, campaignId: string) {
    const campaign = await this.getCampaignById(organizationId, campaignId);

    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException('Campaign is already running');
    }

    if (campaign.totalContacts === 0) {
      throw new BadRequestException('Campaign has no contacts');
    }

    // Mark as running
    await this.prisma.autoCallCampaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    this.activeCampaigns.set(campaignId, true);

    // Start calling process in background
    this.processCampaignCalls(organizationId, campaignId).catch((error) => {
      this.logger.error(`Campaign ${campaignId} failed:`, error);
    });

    return { message: 'Campaign started successfully', campaignId };
  }

  async stopCampaign(organizationId: number, campaignId: string) {
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

  private async processCampaignCalls(organizationId: number, campaignId: string) {
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
      // Check if campaign is still active
      if (!this.activeCampaigns.get(campaignId)) {
        this.logger.log(`Campaign ${campaignId} stopped by user`);
        break;
      }

      // Update status to CALLING
      await this.prisma.autoCallCampaignContact.update({
        where: { id: campaignContact.id },
        data: { callStatus: CampaignCallStatus.CALLING },
      });

      // Emit WebSocket event
      this.gateway.emitCampaignUpdate(organizationId, {
        campaignId,
        contactId: campaignContact.contactId,
        status: 'calling',
        contact: campaignContact.contact,
      });

      // Simulate calling (replace with actual AI agent call)
      const callResult = await this.makeCall(campaignContact.contact);

      // Update campaign contact
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

      // Update contact
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

      // Update campaign stats
      const stats = await this.calculateCampaignStats(campaignId);
      await this.prisma.autoCallCampaign.update({
        where: { id: campaignId },
        data: {
          calledContacts: stats.called,
          successfulCalls: stats.success,
          failedCalls: stats.failed,
        },
      });

      // Emit real-time update
      this.gateway.emitCampaignUpdate(organizationId, {
        campaignId,
        contactId: campaignContact.contactId,
        status: callResult.status,
        contact: campaignContact.contact,
        outcome: callResult.outcome,
        summary: callResult.summary,
      });

      // Delay between calls (simulate real calling)
      await this.delay(2000);
    }

    // Mark campaign as completed
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

  private async makeCall(contact: any): Promise<{
    status: CampaignCallStatus;
    outcome: string;
    summary: string;
    duration: number;
    recordingUrl?: string;
  }> {
    // TODO: Replace with actual AI agent calling logic
    // This is a simulation
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
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      recordingUrl: undefined,
    };
  }

  private async calculateCampaignStats(campaignId: string) {
    const contacts = await this.prisma.autoCallCampaignContact.findMany({
      where: { campaignId },
    });

    const called = contacts.filter((c) => c.callStatus !== CampaignCallStatus.PENDING).length;
    const success = contacts.filter((c) =>
      [CampaignCallStatus.SUCCESS, CampaignCallStatus.PROMISE_TO_PAY].includes(c.callStatus as any),
    ).length;
    const failed = contacts.filter((c) =>
      [CampaignCallStatus.FAILED, CampaignCallStatus.REFUSED, CampaignCallStatus.NO_ANSWER].includes(c.callStatus as any),
    ).length;

    return { called, success, failed };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
