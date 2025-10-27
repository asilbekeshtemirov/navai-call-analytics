import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CallResult {
  callId: string;
  clid: string | null;
}

@Injectable()
export class PbxIntegrationService {
  private readonly logger = new Logger(PbxIntegrationService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultUser: string;
  private readonly defaultClid: string;

  constructor(private configService: ConfigService) {
    const domain = this.configService.get<string>('PBX_DOMAIN', 'mutolaaxona.sip.uz');
    this.baseUrl = `https://${domain}/crmapi/v1`;
    this.apiKey = this.configService.get<string>('PBX_API_KEY', '');
    this.defaultUser = this.configService.get<string>('PBX_DEFAULT_USER', 'admin');
    this.defaultClid = this.configService.get<string>('PBX_DEFAULT_CLID', '');
  }

  async initiateCall(phone: string, customData?: any): Promise<CallResult> {
    const url = `${this.baseUrl}/makecall`;

    const payload = {
      phone: phone.replace(/\+/g, ''), // Remove + sign
      user: this.defaultUser,
      clid: this.defaultClid,
      ...(customData && { custom_data: customData }),
    };

    this.logger.log(`Initiating call to ${phone}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      this.logger.log(`Call initiated successfully. Call ID: ${response.data.callid}`);

      return {
        callId: response.data.callid,
        clid: response.data.clid || null,
      };
    } catch (error) {
      this.logger.error(`Failed to initiate call: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async getCallStatus(callId: string): Promise<any> {
    // Note: This endpoint may not be available in your PBX
    // Implement if your PBX supports call status checking
    this.logger.warn('getCallStatus not implemented for this PBX');
    return null;
  }

  async hangupCall(callId: string): Promise<void> {
    // Note: This endpoint may not be available in your PBX
    // Implement if your PBX supports call hangup
    this.logger.warn('hangupCall not implemented for this PBX');
  }
}
