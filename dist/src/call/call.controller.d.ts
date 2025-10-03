import { CallService } from './call.service.js';
export declare class CallController {
    private readonly callService;
    private readonly logger;
    constructor(callService: CallService);
    findAll(branchId?: string, departmentId?: string, employeeId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<({
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
        branchId: string | null;
        departmentId: string | null;
        employeeId: string;
        status: import("@prisma/client").$Enums.CallStatus;
        id: string;
        externalId: string;
        managerId: string | null;
        fileUrl: string;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
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
            branchId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
        employee: {
            branchId: string | null;
            departmentId: string | null;
            id: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            updatedAt: Date;
        };
        manager: {
            branchId: string | null;
            departmentId: string | null;
            id: string;
            createdAt: Date;
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
        branchId: string | null;
        departmentId: string | null;
        employeeId: string;
        status: import("@prisma/client").$Enums.CallStatus;
        id: string;
        externalId: string;
        managerId: string | null;
        fileUrl: string;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        createdAt: Date;
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
