import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

    if (accountSid && authToken && accountSid !== 'your_twilio_account_sid_here') {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('Twilio client initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client:', error);
      }
    } else {
      this.logger.warn('Twilio credentials not configured. Real calls will be simulated.');
    }
  }

  /**
   * Check if Twilio is properly configured
   */
  isConfigured(): boolean {
    return this.twilioClient !== null && !!this.fromNumber;
  }

  /**
   * Make a real phone call using Twilio
   */
  async makeCall(toNumber: string, twimlUrl: string): Promise<{
    success: boolean;
    callSid?: string;
    status?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Twilio is not configured',
      };
    }

    try {
      this.logger.log(`Initiating call to ${toNumber}`);

      const call = await this.twilioClient!.calls.create({
        to: toNumber,
        from: this.fromNumber,
        url: twimlUrl, // TwiML URL that defines call behavior
        statusCallback: `${this.configService.get('BASE_URL')}/auto-calling/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true, // Record the call
        recordingStatusCallback: `${this.configService.get('BASE_URL')}/auto-calling/twilio/recording`,
        recordingStatusCallbackMethod: 'POST',
      });

      this.logger.log(`Call initiated: ${call.sid}`);

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to make call to ${toNumber}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Get call details
   */
  async getCallDetails(callSid: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const call = await this.twilioClient!.calls(callSid).fetch();
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
    } catch (error: any) {
      this.logger.error(`Failed to fetch call details for ${callSid}:`, error);
      return null;
    }
  }

  /**
   * Get call recordings
   */
  async getCallRecordings(callSid: string): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const recordings = await this.twilioClient!.recordings.list({
        callSid: callSid,
      });

      return recordings.map((recording) =>
        `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`
      );
    } catch (error: any) {
      this.logger.error(`Failed to fetch recordings for ${callSid}:`, error);
      return [];
    }
  }

  /**
   * Generate TwiML for a call script
   */
  generateTwiML(script: string, language: string = 'uz-UZ', voice: string = 'Polly.Zehra'): string {
    const twiml = new twilio.twiml.VoiceResponse();

    // Say the script
    twiml.say({
      voice: voice as any,
      language: language as any,
    }, script);

    // Gather response (if needed)
    const gather = twiml.gather({
      input: ['speech', 'dtmf'],
      timeout: 5,
      action: '/auto-calling/twilio/handle-response',
      method: 'POST',
      language: language as any,
    });

    gather.say({
      voice: voice as any,
      language: language as any,
    }, 'Iltimos, javob bering.');

    // If no input, say goodbye
    twiml.say({
      voice: voice as any,
      language: language as any,
    }, 'Javob olmadim. Xayr.');

    return twiml.toString();
  }

  /**
   * Send SMS (bonus feature)
   */
  async sendSMS(toNumber: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.twilioClient!.messages.create({
        to: toNumber,
        from: this.fromNumber,
        body: message,
      });

      this.logger.log(`SMS sent to ${toNumber}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send SMS to ${toNumber}:`, error);
      return false;
    }
  }
}
