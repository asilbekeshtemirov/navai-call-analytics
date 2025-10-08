import { CallService } from './call.service.js';
export declare const numbersStorage: import("multer").StorageEngine;
export declare class CallController {
    private readonly callService;
    private readonly logger;
    constructor(callService: CallService);
    uploadFile(file: Express.Multer.File): Promise<any>;
    startProcess(): Promise<any>;
    findAll(organizationId: number, branchId?: string, departmentId?: string, employeeId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<({
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
                organizationId: number;
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
        organizationId: number;
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
        createdAt: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(organizationId: number, id: string): Promise<({
        branch: {
            id: string;
            organizationId: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        } | null;
        department: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
        employee: {
            id: string;
            organizationId: number;
            branchId: string | null;
            departmentId: string | null;
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
            id: string;
            organizationId: number;
            branchId: string | null;
            departmentId: string | null;
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
                organizationId: number;
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
        organizationId: number;
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
    getSessionStatus(sessionId: string): Promise<{
        durationSeconds: number;
        progressPercentage: number;
        statusDescription: string;
        isRunning: boolean;
        isCompleted: boolean;
        hasError: boolean;
        id: string;
        organizationId: number;
        status: import("@prisma/client").$Enums.SessionStatus;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        totalNumbers: number;
        processedNumbers: number;
        connectedCalls: number;
        failedCalls: number;
        remoteResponse: string | null;
        errorMessage: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    getAllSessions(limit?: string): Promise<{
        durationSeconds: number | null;
        progressPercentage: number;
        statusDescription: string;
        isRunning: boolean;
        isCompleted: boolean;
        hasError: boolean;
        id: string;
        organizationId: number;
        status: import("@prisma/client").$Enums.SessionStatus;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        totalNumbers: number;
        processedNumbers: number;
        connectedCalls: number;
        failedCalls: number;
        remoteResponse: string | null;
        errorMessage: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }[]>;
}
