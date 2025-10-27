var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PbxIntegrationService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
let PbxIntegrationService = PbxIntegrationService_1 = class PbxIntegrationService {
    configService;
    logger = new Logger(PbxIntegrationService_1.name);
    baseUrl;
    apiKey;
    defaultUser;
    defaultClid;
    constructor(configService) {
        this.configService = configService;
        const domain = this.configService.get('PBX_DOMAIN', 'mutolaaxona.sip.uz');
        this.baseUrl = `https://${domain}/crmapi/v1`;
        this.apiKey = this.configService.get('PBX_API_KEY', '');
        this.defaultUser = this.configService.get('PBX_DEFAULT_USER', 'admin');
        this.defaultClid = this.configService.get('PBX_DEFAULT_CLID', '');
    }
    async initiateCall(phone, customData) {
        const url = `${this.baseUrl}/makecall`;
        const payload = {
            phone: phone.replace(/\+/g, ''),
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
        }
        catch (error) {
            this.logger.error(`Failed to initiate call: ${error.message}`);
            if (error.response) {
                this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    async getCallStatus(callId) {
        this.logger.warn('getCallStatus not implemented for this PBX');
        return null;
    }
    async hangupCall(callId) {
        this.logger.warn('hangupCall not implemented for this PBX');
    }
};
PbxIntegrationService = PbxIntegrationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], PbxIntegrationService);
export { PbxIntegrationService };
//# sourceMappingURL=pbx-integration.service.js.map