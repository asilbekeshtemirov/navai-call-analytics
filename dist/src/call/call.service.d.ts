import { PrismaService } from '../prisma/prisma.service.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
import { CreateCallDto } from './dto/create-call.dto.js';
import { AiService } from '../ai/ai.service.js';
import { HistoryDto, EventDto, ContactDto, RatingDto } from './dto/vats-webhook.dto.js';
export declare class CallService {
    private readonly prisma;
    private readonly aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    handleHistory(data: HistoryDto): Promise<{
        message: string;
        callId?: undefined;
    } | {
        message: string;
        callId: string;
    }>;
    handleEvent(data: EventDto): Promise<{
        message: string;
    }>;
    handleContact(data: ContactDto): Promise<{
        contact_name: string;
        responsible: string;
    }>;
    handleRating(data: RatingDto): Promise<{
        message: string;
    }>;
    create(createCallDto: CreateCallDto): Promise<{
        id: string;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
    }>;
    createManualCall(data: {
        employeeId: string;
        callerNumber: string;
        calleeNumber: string;
        durationSec: number;
        audioUrl?: string;
    }): Promise<{
        id: string;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
    }>;
    uploadFromUrl(uploadFromUrlDto: UploadFromUrlDto): Promise<{
        id: string;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
    }>;
    findAll(filters?: {
        branchId?: string;
        departmentId?: string;
        employeeId?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<({
        branch: {
            id: string;
            name: string;
        } | null;
        department: {
            id: string;
            name: string;
        } | null;
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            extCode: string | null;
        };
        scores: ({
            criteria: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                weight: number;
                description: string | null;
            };
        } & {
            id: string;
            callId: string;
            criteriaId: string;
            score: number;
            notes: string | null;
        })[];
        violations: {
            id: string;
            callId: string;
            type: string;
            timestampMs: number;
            details: string | null;
        }[];
    } & {
        id: string;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        } | null;
        department: {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            name: string;
        } | null;
        employee: {
            id: string;
            createdAt: Date;
            branchId: string | null;
            departmentId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            updatedAt: Date;
        };
        manager: {
            id: string;
            createdAt: Date;
            branchId: string | null;
            departmentId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            updatedAt: Date;
        } | null;
        scores: ({
            criteria: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                weight: number;
                description: string | null;
            };
        } & {
            id: string;
            callId: string;
            criteriaId: string;
            score: number;
            notes: string | null;
        })[];
        segments: {
            id: string;
            callId: string;
            startMs: number;
            endMs: number;
            speaker: string;
            text: string;
        }[];
        violations: {
            id: string;
            callId: string;
            type: string;
            timestampMs: number;
            details: string | null;
        }[];
    } & {
        id: string;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
    }) | null>;
    getTranscript(callId: string): Promise<{
        id: string;
        callId: string;
        startMs: number;
        endMs: number;
        speaker: string;
        text: string;
    }[]>;
}
