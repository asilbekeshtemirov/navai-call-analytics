import { CallService } from './call.service.js';
export declare const numbersStorage: import("multer").StorageEngine;
export declare class CallController {
    private readonly callService;
    private readonly logger;
    constructor(callService: CallService);
    uploadFile(file: Express.Multer.File): Promise<any>;
    startProcess(): Promise<any>;
    findAll(branchId?: string, departmentId?: string, employeeId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<({
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
                updatedAt: Date;
                name: string;
                createdAt: Date;
                weight: number;
                description: string | null;
            };
        } & {
            id: string;
            criteriaId: string;
            notes: string | null;
            score: number;
            callId: string;
        })[];
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            extCode: string | null;
        };
        violations: {
            id: string;
            type: string;
            timestampMs: number;
            details: string | null;
            callId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        branchId: string | null;
        departmentId: string | null;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        branch: {
            id: string;
            updatedAt: Date;
            name: string;
            address: string | null;
            createdAt: Date;
        } | null;
        department: {
            id: string;
            updatedAt: Date;
            name: string;
            createdAt: Date;
            branchId: string;
        } | null;
        scores: ({
            criteria: {
                id: string;
                updatedAt: Date;
                name: string;
                createdAt: Date;
                weight: number;
                description: string | null;
            };
        } & {
            id: string;
            criteriaId: string;
            notes: string | null;
            score: number;
            callId: string;
        })[];
        employee: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            branchId: string | null;
            phone: string;
            firstName: string;
            lastName: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
        };
        manager: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            branchId: string | null;
            phone: string;
            firstName: string;
            lastName: string;
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
            type: string;
            timestampMs: number;
            details: string | null;
            callId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        branchId: string | null;
        departmentId: string | null;
        externalId: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.CallStatus;
        callerNumber: string | null;
        calleeNumber: string | null;
        callDate: Date;
        durationSec: number | null;
        transcription: string | null;
        analysis: import("@prisma/client/runtime/library").JsonValue | null;
        employeeId: string;
        managerId: string | null;
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
        updatedAt: Date;
        createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
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
