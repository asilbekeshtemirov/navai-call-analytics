export declare class SipuniRecordDto {
    recordId: string;
    callId: string;
    caller?: string;
    callee?: string;
    startTime?: string;
    duration?: number;
    recordUrl?: string;
    status?: string;
}
export interface SipuniCallRecord {
    uid: string;
    client: string;
    caller?: string;
    start?: string;
    start_time?: number;
    record?: string;
    type?: string;
    status?: string;
    diversion?: string;
    destination?: string;
    user?: string;
    user_name?: string;
    wait?: number;
    duration?: number;
}
