var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TwilioService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
let TwilioService = TwilioService_1 = class TwilioService {
    configService;
    logger = new Logger(TwilioService_1.name);
    twilioClient = null;
    fromNumber;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER') || '';
        if (accountSid && authToken && accountSid !== 'your_twilio_account_sid_here') {
            try {
                this.twilioClient = twilio(accountSid, authToken);
                this.logger.log('Twilio client initialized successfully');
            }
            catch (error) {
                this.logger.error('Failed to initialize Twilio client:', error);
            }
        }
        else {
            this.logger.warn('Twilio credentials not configured. Real calls will be simulated.');
        }
    }
    isConfigured() {
        return this.twilioClient !== null && !!this.fromNumber;
    }
    async makeCall(toNumber, twimlUrl) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Twilio is not configured',
            };
        }
        try {
            this.logger.log(`Initiating call to ${toNumber}`);
            const call = await this.twilioClient.calls.create({
                to: toNumber,
                from: this.fromNumber,
                url: twimlUrl,
                statusCallback: `${this.configService.get('BASE_URL')}/auto-calling/twilio/status`,
                statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                statusCallbackMethod: 'POST',
                record: true,
                recordingStatusCallback: `${this.configService.get('BASE_URL')}/auto-calling/twilio/recording`,
                recordingStatusCallbackMethod: 'POST',
            });
            this.logger.log(`Call initiated: ${call.sid}`);
            return {
                success: true,
                callSid: call.sid,
                status: call.status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to make call to ${toNumber}:`, error);
            return {
                success: false,
                error: error.message || 'Unknown error',
            };
        }
    }
    async getCallDetails(callSid) {
        if (!this.isConfigured()) {
            return null;
        }
        try {
            const call = await this.twilioClient.calls(callSid).fetch();
            return {
                sid: call.sid,
                status: call.status,
                duration: call.duration,
                startTime: call.startTime,
                endTime: call.endTime,
                direction: call.direction,
                from: call.from,
                to: call.to,
                price: call.price,
                priceUnit: call.priceUnit,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch call details for ${callSid}:`, error);
            return null;
        }
    }
    async getCallRecordings(callSid) {
        if (!this.isConfigured()) {
            return [];
        }
        try {
            const recordings = await this.twilioClient.recordings.list({
                callSid: callSid,
            });
            return recordings.map((recording) => `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`);
        }
        catch (error) {
            this.logger.error(`Failed to fetch recordings for ${callSid}:`, error);
            return [];
        }
    }
    generateTwiML(script, language = 'uz-UZ', voice = 'Polly.Zehra') {
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({
            voice: voice,
            language: language,
        }, script);
        const gather = twiml.gather({
            input: ['speech', 'dtmf'],
            timeout: 5,
            action: '/auto-calling/twilio/handle-response',
            method: 'POST',
            language: language,
        });
        gather.say({
            voice: voice,
            language: language,
        }, 'Iltimos, javob bering.');
        twiml.say({
            voice: voice,
            language: language,
        }, 'Javob olmadim. Xayr.');
        return twiml.toString();
    }
    async sendSMS(toNumber, message) {
        if (!this.isConfigured()) {
            return false;
        }
        try {
            await this.twilioClient.messages.create({
                to: toNumber,
                from: this.fromNumber,
                body: message,
            });
            this.logger.log(`SMS sent to ${toNumber}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${toNumber}:`, error);
            return false;
        }
    }
};
TwilioService = TwilioService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], TwilioService);
export { TwilioService };
//# sourceMappingURL=twilio.service.js.map