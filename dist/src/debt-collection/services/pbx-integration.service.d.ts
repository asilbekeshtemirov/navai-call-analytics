import { ConfigService } from '@nestjs/config';
interface CallResult {
    callId: string;
    clid: string | null;
}
export declare class PbxIntegrationService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly defaultUser;
    private readonly defaultClid;
    constructor(configService: ConfigService);
    initiateCall(phone: string, customData?: any): Promise<CallResult>;
    getCallStatus(callId: string): Promise<any>;
    hangupCall(callId: string): Promise<void>;
}
export {};
