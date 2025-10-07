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
        scores: ({
            criteria: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                organizationId: number;
                weight: number;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
            notes: string | null;
        })[];
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
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
        externalId: string;
        employeeId: string;
        managerId: string | null;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(organizationId: number, id: string): Promise<({
        branch: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            address: string | null;
        } | null;
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        } | null;
        scores: ({
            criteria: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                organizationId: number;
                weight: number;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
            notes: string | null;
        })[];
        employee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            branchId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
        };
        manager: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            branchId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
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
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
        externalId: string;
        employeeId: string;
        managerId: string | null;
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
    getSessionStatus(sessionId: string): Promise<{
        durationSeconds: number;
        progressPercentage: number;
        statusDescription: string;
        isRunning: boolean;
        isCompleted: boolean;
        hasError: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        status: import("@prisma/client").$Enums.SessionStatus;
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
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        status: import("@prisma/client").$Enums.SessionStatus;
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
