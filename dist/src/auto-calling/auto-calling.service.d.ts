import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { CampaignStatus, ContactStatus } from '@prisma/client';
import { AutoCallingGateway } from './auto-calling.gateway.js';
import { TwilioService } from './twilio.service.js';
export declare class AutoCallingService {
    private readonly prisma;
    private readonly gateway;
    private readonly twilioService;
    private readonly configService;
    private readonly logger;
    private activeCampaigns;
    private callSids;
    constructor(prisma: PrismaService, gateway: AutoCallingGateway, twilioService: TwilioService, configService: ConfigService);
    createContact(organizationId: number, dto: CreateContactDto): Promise<{
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string;
        status: import("@prisma/client").$Enums.ContactStatus;
        notes: string | null;
        dateOfBirth: Date | null;
        customData: import("@prisma/client/runtime/library").JsonValue | null;
        lastConversationOutcome: string | null;
        currentConversationOutcome: string | null;
        lastConversationDate: Date | null;
        isCalled: boolean;
        lastContactDate: Date | null;
    }>;
    findAllContacts(organizationId: number, page?: number, limit?: number, status?: ContactStatus): Promise<{
        data: {
            id: string;
            organizationId: number;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            status: import("@prisma/client").$Enums.ContactStatus;
            notes: string | null;
            dateOfBirth: Date | null;
            customData: import("@prisma/client/runtime/library").JsonValue | null;
            lastConversationOutcome: string | null;
            currentConversationOutcome: string | null;
            lastConversationDate: Date | null;
            isCalled: boolean;
            lastContactDate: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findContactById(organizationId: number, id: string): Promise<{
        campaignContacts: ({
            campaign: {
                id: string;
                organizationId: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.CampaignStatus;
                description: string | null;
                failedCalls: number;
                startedAt: Date | null;
                completedAt: Date | null;
                campaignType: import("@prisma/client").$Enums.CampaignType;
                totalContacts: number;
                calledContacts: number;
                successfulCalls: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            campaignId: string;
            contactId: string;
            callStatus: import("@prisma/client").$Enums.CampaignCallStatus;
            callAttempts: number;
            lastCallDate: Date | null;
            conversationOutcome: string | null;
            conversationSummary: string | null;
            recordingUrl: string | null;
            callDuration: number | null;
        })[];
    } & {
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string;
        status: import("@prisma/client").$Enums.ContactStatus;
        notes: string | null;
        dateOfBirth: Date | null;
        customData: import("@prisma/client/runtime/library").JsonValue | null;
        lastConversationOutcome: string | null;
        currentConversationOutcome: string | null;
        lastConversationDate: Date | null;
        isCalled: boolean;
        lastContactDate: Date | null;
    }>;
    updateContact(organizationId: number, id: string, dto: UpdateContactDto): Promise<{
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string;
        status: import("@prisma/client").$Enums.ContactStatus;
        notes: string | null;
        dateOfBirth: Date | null;
        customData: import("@prisma/client/runtime/library").JsonValue | null;
        lastConversationOutcome: string | null;
        currentConversationOutcome: string | null;
        lastConversationDate: Date | null;
        isCalled: boolean;
        lastContactDate: Date | null;
    }>;
    deleteContact(organizationId: number, id: string): Promise<{
        message: string;
    }>;
    createCampaign(organizationId: number, dto: CreateCampaignDto): Promise<{
        campaignContacts: ({
            contact: {
                id: string;
                organizationId: number;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string;
                status: import("@prisma/client").$Enums.ContactStatus;
                notes: string | null;
                dateOfBirth: Date | null;
                customData: import("@prisma/client/runtime/library").JsonValue | null;
                lastConversationOutcome: string | null;
                currentConversationOutcome: string | null;
                lastConversationDate: Date | null;
                isCalled: boolean;
                lastContactDate: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            campaignId: string;
            contactId: string;
            callStatus: import("@prisma/client").$Enums.CampaignCallStatus;
            callAttempts: number;
            lastCallDate: Date | null;
            conversationOutcome: string | null;
            conversationSummary: string | null;
            recordingUrl: string | null;
            callDuration: number | null;
        })[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        campaignType: import("@prisma/client").$Enums.CampaignType;
        totalContacts: number;
        calledContacts: number;
        successfulCalls: number;
    }>;
    addContactsToCampaign(organizationId: number, campaignId: string, contactIds: string[]): Promise<{
        campaignContacts: ({
            contact: {
                id: string;
                organizationId: number;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string;
                status: import("@prisma/client").$Enums.ContactStatus;
                notes: string | null;
                dateOfBirth: Date | null;
                customData: import("@prisma/client/runtime/library").JsonValue | null;
                lastConversationOutcome: string | null;
                currentConversationOutcome: string | null;
                lastConversationDate: Date | null;
                isCalled: boolean;
                lastContactDate: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            campaignId: string;
            contactId: string;
            callStatus: import("@prisma/client").$Enums.CampaignCallStatus;
            callAttempts: number;
            lastCallDate: Date | null;
            conversationOutcome: string | null;
            conversationSummary: string | null;
            recordingUrl: string | null;
            callDuration: number | null;
        })[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        campaignType: import("@prisma/client").$Enums.CampaignType;
        totalContacts: number;
        calledContacts: number;
        successfulCalls: number;
    }>;
    getCampaignById(organizationId: number, id: string): Promise<{
        campaignContacts: ({
            contact: {
                id: string;
                organizationId: number;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string;
                status: import("@prisma/client").$Enums.ContactStatus;
                notes: string | null;
                dateOfBirth: Date | null;
                customData: import("@prisma/client/runtime/library").JsonValue | null;
                lastConversationOutcome: string | null;
                currentConversationOutcome: string | null;
                lastConversationDate: Date | null;
                isCalled: boolean;
                lastContactDate: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            campaignId: string;
            contactId: string;
            callStatus: import("@prisma/client").$Enums.CampaignCallStatus;
            callAttempts: number;
            lastCallDate: Date | null;
            conversationOutcome: string | null;
            conversationSummary: string | null;
            recordingUrl: string | null;
            callDuration: number | null;
        })[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        description: string | null;
        failedCalls: number;
        startedAt: Date | null;
        completedAt: Date | null;
        campaignType: import("@prisma/client").$Enums.CampaignType;
        totalContacts: number;
        calledContacts: number;
        successfulCalls: number;
    }>;
    findAllCampaigns(organizationId: number, page?: number, limit?: number, status?: CampaignStatus): Promise<{
        data: ({
            _count: {
                campaignContacts: number;
            };
        } & {
            id: string;
            organizationId: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.CampaignStatus;
            description: string | null;
            failedCalls: number;
            startedAt: Date | null;
            completedAt: Date | null;
            campaignType: import("@prisma/client").$Enums.CampaignType;
            totalContacts: number;
            calledContacts: number;
            successfulCalls: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    deleteCampaign(organizationId: number, id: string): Promise<{
        message: string;
    }>;
    parseExcelAndCreateContacts(organizationId: number, file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: string[];
        created: any[];
        failedContacts: any[];
    }>;
    startCampaign(organizationId: number, campaignId: string): Promise<{
        message: string;
        campaignId: string;
    }>;
    stopCampaign(organizationId: number, campaignId: string): Promise<{
        message: string;
    }>;
    private processCampaignCalls;
    private makeCall;
    private makeRealCall;
    private simulateCall;
    private generateCallScript;
    private mapTwilioStatusToCampaignStatus;
    private getOutcomeFromCallStatus;
    private calculateCampaignStats;
    private delay;
    generateTwiMLForContact(contactId: string): Promise<{
        twiml: string;
        contentType?: undefined;
    } | {
        twiml: string;
        contentType: string;
    }>;
    handleTwilioCallStatus(body: any): Promise<{
        success: boolean;
    }>;
    handleTwilioRecording(body: any): Promise<{
        success: boolean;
    }>;
    handleUserResponse(body: any): Promise<{
        twiml: string;
    }>;
}
