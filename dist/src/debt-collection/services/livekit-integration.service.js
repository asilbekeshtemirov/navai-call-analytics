var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LiveKitIntegrationService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
let LiveKitIntegrationService = LiveKitIntegrationService_1 = class LiveKitIntegrationService {
    configService;
    logger = new Logger(LiveKitIntegrationService_1.name);
    livekitUrl;
    livekitApiKey;
    livekitApiSecret;
    roomService;
    constructor(configService) {
        this.configService = configService;
        this.livekitUrl = this.configService.get('LIVEKIT_URL', '');
        this.livekitApiKey = this.configService.get('LIVEKIT_API_KEY', '');
        this.livekitApiSecret = this.configService.get('LIVEKIT_API_SECRET', '');
        if (this.livekitUrl && this.livekitApiKey && this.livekitApiSecret) {
            this.roomService = new RoomServiceClient(this.livekitUrl, this.livekitApiKey, this.livekitApiSecret);
        }
    }
    async createRoom(roomName, metadata) {
        try {
            this.logger.log(`Creating LiveKit room: ${roomName}`);
            if (!this.roomService) {
                throw new Error('LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your .env file');
            }
            const room = await this.roomService.createRoom({
                name: roomName,
                emptyTimeout: 300,
                maxParticipants: 2,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            });
            this.logger.log(`Room created successfully: ${roomName}`);
            return room;
        }
        catch (error) {
            this.logger.error(`Failed to create room: ${error.message}`);
            throw error;
        }
    }
    async deleteRoom(roomName) {
        try {
            this.logger.log(`Deleting LiveKit room: ${roomName}`);
            if (!this.roomService) {
                this.logger.warn('LiveKit is not configured, skipping room deletion');
                return;
            }
            await this.roomService.deleteRoom(roomName);
            this.logger.log(`Room deleted: ${roomName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete room: ${error.message}`);
        }
    }
    async generateRoomToken(roomName, participantName) {
        const token = new AccessToken(this.livekitApiKey, this.livekitApiSecret, {
            identity: participantName,
        });
        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });
        return await token.toJwt();
    }
    getRoomUrl(roomName) {
        return `${this.livekitUrl}/${roomName}`;
    }
    async listParticipants(roomName) {
        try {
            if (!this.roomService) {
                this.logger.warn('LiveKit is not configured');
                return [];
            }
            const participants = await this.roomService.listParticipants(roomName);
            return participants;
        }
        catch (error) {
            this.logger.error(`Failed to list participants: ${error.message}`);
            return [];
        }
    }
    async removeParticipant(roomName, participantIdentity) {
        try {
            this.logger.log(`Removing participant ${participantIdentity} from room ${roomName}`);
            if (!this.roomService) {
                this.logger.warn('LiveKit is not configured, skipping participant removal');
                return;
            }
            await this.roomService.removeParticipant(roomName, participantIdentity);
        }
        catch (error) {
            this.logger.error(`Failed to remove participant: ${error.message}`);
        }
    }
};
LiveKitIntegrationService = LiveKitIntegrationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], LiveKitIntegrationService);
export { LiveKitIntegrationService };
//# sourceMappingURL=livekit-integration.service.js.map