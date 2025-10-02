import { PrismaService } from '../prisma/prisma.service.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
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
    uploadFromUrl(uploadFromUrlDto: UploadFromUrlDto): Promise<{
        id: string;
        createdAt: Date;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(filters?: {
        branchId?: string;
        departmentId?: string;
        employeeId?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<({
        scores: ({
            criteria: {
                id: string;
                name: string;
                weight: number;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
            notes: string | null;
        })[];
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
        violations: {
            id: string;
            callId: string;
            timestampMs: number;
            type: string;
            details: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<({
        scores: ({
            criteria: {
                id: string;
                name: string;
                weight: number;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
            notes: string | null;
        })[];
        branch: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
        } | null;
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        } | null;
        employee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            departmentId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
        };
        manager: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            departmentId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
        } | null;
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
            timestampMs: number;
            type: string;
            details: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        branchId: string | null;
        departmentId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
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
