import { ConfigService } from '@nestjs/config';
export declare class TwilioService {
    private configService;
    private readonly logger;
    private twilioClient;
    private fromNumber;
    constructor(configService: ConfigService);
    isConfigured(): boolean;
    makeCall(toNumber: string, twimlUrl: string): Promise<{
        success: boolean;
        callSid?: string;
        status?: string;
        error?: string;
    }>;
    getCallDetails(callSid: string): Promise<any>;
    getCallRecordings(callSid: string): Promise<string[]>;
    generateTwiML(script: string, language?: string, voice?: string): string;
    sendSMS(toNumber: string, message: string): Promise<boolean>;
}
