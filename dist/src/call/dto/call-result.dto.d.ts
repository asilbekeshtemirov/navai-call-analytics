export declare enum CallResultStatus {
    ANSWERED = "ANSWERED",
    NO_ANSWER = "NO_ANSWER",
    BUSY = "BUSY",
    FAILED = "FAILED",
    CONNECTED_TO_OPERATOR = "CONNECTED_TO_OPERATOR",
    REJECTED = "REJECTED",
    INVALID_NUMBER = "INVALID_NUMBER",
    NETWORK_ERROR = "NETWORK_ERROR"
}
export declare class CallResultDto {
    sessionId: string;
    phoneNumber: string;
    callStatus: CallResultStatus;
    callDuration?: number;
    operatorName?: string;
    operatorId?: string;
    callStartTime?: string;
    callEndTime?: string;
    recordingUrl?: string;
    notes?: string;
}
export declare class CallResultResponseDto {
    id: string;
    sessionId: string;
    phoneNumber: string;
    callStatus: CallResultStatus;
    callDuration: number | null;
    operatorName: string | null;
    operatorId: string | null;
    callStartTime: Date | null;
    callEndTime: Date | null;
    recordingUrl: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    statusDescription?: string;
}
