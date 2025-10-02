import { CallService } from './call.service.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
import { HistoryDto, EventDto, ContactDto, RatingDto } from './dto/vats-webhook.dto.js';
export declare class CallController {
    private readonly callService;
    private readonly logger;
    constructor(callService: CallService);
    handleVatsWebhook(body: HistoryDto | EventDto | ContactDto | RatingDto): Promise<{
        message: string;
    } | {
        contact_name: string;
        responsible: string;
    } | undefined>;
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
    findAll(branchId?: string, departmentId?: string, employeeId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<({
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
    getTranscript(id: string): Promise<{
        id: string;
        callId: string;
        startMs: number;
        endMs: number;
        speaker: string;
        text: string;
    }[]>;
}
