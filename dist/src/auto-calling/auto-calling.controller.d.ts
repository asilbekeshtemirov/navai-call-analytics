import { AutoCallingService } from './auto-calling.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { ContactStatus, CampaignStatus } from '@prisma/client';
export declare class AutoCallingController {
    private readonly autoCallingService;
    constructor(autoCallingService: AutoCallingService);
    createContact(req: any, createContactDto: CreateContactDto): Promise<{
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
    findAllContacts(req: any, page?: number, limit?: number, status?: ContactStatus): Promise<{
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
    findContactById(req: any, id: string): Promise<{
        data: {
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
        };
    }>;
    updateContact(req: any, id: string, updateContactDto: UpdateContactDto): Promise<{
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
    deleteContact(req: any, id: string): Promise<{
        message: string;
    }>;
    uploadExcel(req: any, file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: string[];
        created: any[];
        failedContacts: any[];
    }>;
    createCampaign(req: any, createCampaignDto: CreateCampaignDto): Promise<{
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
    findAllCampaigns(req: any, page?: number, limit?: number, status?: CampaignStatus): Promise<{
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
    getCampaignById(req: any, id: string): Promise<{
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
    addContactsToCampaign(req: any, id: string, contactIds: string[]): Promise<{
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
    deleteCampaign(req: any, id: string): Promise<{
        message: string;
    }>;
    startCampaign(req: any, id: string): Promise<{
        message: string;
        campaignId: string;
    }>;
    stopCampaign(req: any, id: string): Promise<{
        message: string;
    }>;
    getTwiML(contactId: string): Promise<{
        twiml: string;
        contentType?: undefined;
    } | {
        twiml: string;
        contentType: string;
    }>;
    handleCallStatus(body: any): Promise<{
        success: boolean;
    }>;
    handleRecording(body: any): Promise<{
        success: boolean;
    }>;
    handleResponse(body: any): Promise<{
        twiml: string;
    }>;
}
