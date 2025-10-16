import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
export declare class CallService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    private sshUploadFile;
    private sshRunCommand;
    uploadFile(file: Express.Multer.File): Promise<any>;
    startProcess(): Promise<any>;
    findAll(organizationId: number, filters?: {
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
            extCode: string | null;
            firstName: string;
            lastName: string;
        };
        scores: ({
            criteria: {
                id: string;
                organizationId: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                weight: number;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
            notes: string | null;
        })[];
        violations: {
            id: string;
            callId: string;
            timestampMs: number;
            type: string;
            details: string | null;
        }[];
    } & {
        id: string;
        organizationId: number;
        createdAt: Date;
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
            organizationId: number;
            name: string;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            organizationId: number;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            extCode: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
            auto_calling: boolean;
        };
        manager: {
            id: string;
            organizationId: number;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            extCode: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
            auto_calling: boolean;
        } | null;
        scores: ({
            criteria: {
                id: string;
                organizationId: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                weight: number;
            };
        } & {
            id: string;
            score: number;
            callId: string;
            criteriaId: string;
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
            timestampMs: number;
            type: string;
            details: string | null;
        }[];
    } & {
        id: string;
        organizationId: number;
        createdAt: Date;
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
    getTranscript(callId: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
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
    getAllSessions(limit?: number): Promise<{
        durationSeconds: number | null;
        progressPercentage: number;
        statusDescription: string;
        isRunning: boolean;
        isCompleted: boolean;
        hasError: boolean;
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
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
    start(): {
        message: string;
    };
}
