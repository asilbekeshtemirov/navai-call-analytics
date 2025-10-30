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
import { AccessToken, RoomServiceClient, AgentDispatchClient, DataPacket_Kind } from 'livekit-server-sdk';
let LiveKitIntegrationService = LiveKitIntegrationService_1 = class LiveKitIntegrationService {
    configService;
    logger = new Logger(LiveKitIntegrationService_1.name);
    livekitUrl;
    livekitApiKey;
    livekitApiSecret;
    roomService;
    agentDispatchClient;
    constructor(configService) {
        this.configService = configService;
        this.livekitUrl = this.configService.get('LIVEKIT_URL', '');
        this.livekitApiKey = this.configService.get('LIVEKIT_API_KEY', '');
        this.livekitApiSecret = this.configService.get('LIVEKIT_API_SECRET', '');
        if (this.livekitUrl && this.livekitApiKey && this.livekitApiSecret) {
            this.roomService = new RoomServiceClient(this.livekitUrl, this.livekitApiKey, this.livekitApiSecret);
            this.agentDispatchClient = new AgentDispatchClient(this.livekitUrl, this.livekitApiKey, this.livekitApiSecret);
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
            await this.dispatchAgent(roomName, 'yoshlar_voice_agent');
            return room;
        }
        catch (error) {
            this.logger.error(`Failed to create room: ${error.message}`);
            throw error;
        }
    }
    async dispatchAgent(roomName, agentName) {
        try {
            const agent = agentName || 'yoshlar_voice_agent';
            this.logger.log(`Dispatching agent "${agent}" to room: ${roomName}`);
            if (!this.agentDispatchClient) {
                throw new Error('LiveKit is not configured');
            }
            const dispatch = await this.agentDispatchClient.createDispatch(roomName, agent);
            this.logger.log(`Agent dispatched successfully to room: ${roomName} (dispatch ID: ${dispatch.id})`);
        }
        catch (error) {
            this.logger.error(`Failed to dispatch agent: ${error.message}`);
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
    async sendDataToRoom(roomName, data, participantSid) {
        try {
            this.logger.log(`📤 Sending data to room: ${roomName}`, JSON.stringify(data, null, 2));
            if (!this.roomService) {
                const error = 'LiveKit is not configured';
                this.logger.error(error);
                throw new Error(error);
            }
            this.logger.log(`🔍 Looking up room: ${roomName}`);
            const rooms = await this.roomService.listRooms([roomName]);
            if (rooms.length === 0) {
                const error = `Room ${roomName} not found`;
                this.logger.error(error);
                throw new Error(error);
            }
            const room = rooms[0];
            this.logger.log(`✅ Found room: ${room.name} (${room.sid}), getting participants`);
            this.logger.log(`📝 Room metadata: ${room.metadata || 'No metadata'}`);
            const participants = await this.roomService.listParticipants(room.name);
            this.logger.log(`👥 Found ${participants.length} participants in room ${room.name}`);
            if (participants.length === 0) {
                this.logger.warn(`⚠️ No participants found in room ${room.name}`);
                return;
            }
            participants.forEach((p, i) => {
                this.logger.log(`👤 Participant ${i + 1}: ${p.identity} (SID: ${p.sid}, Joined: ${new Date(Number(p.joinedAt) * 1000).toISOString()})`);
            });
            const dataStr = JSON.stringify(data);
            this.logger.log(`📝 Data to send (JSON): ${dataStr}`);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(dataStr);
            this.logger.log(`📦 Data buffer length: ${dataBuffer.length} bytes`);
            let successCount = 0;
            for (const participant of participants) {
                if (participantSid && participant.sid !== participantSid) {
                    this.logger.log(`⏭️  Skipping participant ${participant.identity} (${participant.sid}) - not the target`);
                    continue;
                }
                this.logger.log(`📤 Sending data to participant ${participant.identity} (${participant.sid})`);
                try {
                    this.logger.log(`📤 Sending data (${dataBuffer.length} bytes) to ${participant.identity}: ${dataStr}`);
                    await this.roomService.sendData(room.name, dataBuffer, DataPacket_Kind.RELIABLE, {
                        destinationSids: [participant.sid],
                        topic: 'phone-number'
                    });
                    successCount++;
                    this.logger.log(`✅ Successfully sent data to participant ${participant.identity} (${participant.sid})`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error(`❌ Failed to send data to participant ${participant.identity} (${participant.sid}): ${errorMessage}`);
                    if (error instanceof Error && error.stack) {
                        this.logger.error(`Stack trace: ${error.stack}`);
                    }
                    throw error;
                }
            }
            if (successCount === 0) {
                this.logger.warn(`⚠️ No participants received the data message`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to send data to room: ${errorMessage}`, errorStack);
            throw error;
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
    async generateSipParticipantToken(roomName, participantIdentity, phoneNumber) {
        try {
            this.logger.log(`Generating SIP participant token for ${phoneNumber} in room ${roomName}`);
            if (!this.livekitApiKey || !this.livekitApiSecret) {
                throw new Error('LiveKit API credentials not configured');
            }
            const token = new AccessToken(this.livekitApiKey, this.livekitApiSecret, {
                identity: participantIdentity,
                name: `Debtor ${phoneNumber}`,
            });
            token.addGrant({
                roomJoin: true,
                room: roomName,
                canPublish: true,
                canSubscribe: true,
            });
            const jwt = await token.toJwt();
            this.logger.log(`SIP token generated successfully for ${participantIdentity}`);
            return jwt;
        }
        catch (error) {
            this.logger.error(`Failed to generate SIP token: ${error.message}`);
            throw error;
        }
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
    async updateRoomMetadata(roomName, metadata) {
        try {
            this.logger.log(`Updating room metadata for: ${roomName}`);
            if (!this.roomService) {
                throw new Error('LiveKit is not configured');
            }
            await this.roomService.updateRoomMetadata(roomName, metadata);
            this.logger.log(`Room metadata updated: ${roomName}`);
        }
        catch (error) {
            this.logger.error(`Failed to update room metadata: ${error.message}`);
            throw error;
        }
    }
};
LiveKitIntegrationService = LiveKitIntegrationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], LiveKitIntegrationService);
export { LiveKitIntegrationService };
//# sourceMappingURL=livekit-integration.service.js.map