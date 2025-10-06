export declare class SessionStatusDto {
    id: string;
    sessionId: string;
    status: string;
    totalNumbers: number;
    processedNumbers: number;
    connectedCalls: number;
    failedCalls: number;
    remoteResponse: string | null;
    errorMessage: string | null;
    startedAt: Date;
    completedAt: Date | null;
    durationSeconds?: number;
    progressPercentage?: number;
    statusDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}
