import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, AgentDispatchClient, DataPacket_Kind } from 'livekit-server-sdk';

@Injectable()
export class LiveKitIntegrationService {
  private readonly logger = new Logger(LiveKitIntegrationService.name);
  private readonly livekitUrl: string;
  private readonly livekitApiKey: string;
  private readonly livekitApiSecret: string;
  private roomService: RoomServiceClient;
  private agentDispatchClient: AgentDispatchClient;

  constructor(private configService: ConfigService) {
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL', '');
    this.livekitApiKey = this.configService.get<string>('LIVEKIT_API_KEY', '');
    this.livekitApiSecret = this.configService.get<string>('LIVEKIT_API_SECRET', '');

    if (this.livekitUrl && this.livekitApiKey && this.livekitApiSecret) {
      this.roomService = new RoomServiceClient(
        this.livekitUrl,
        this.livekitApiKey,
        this.livekitApiSecret,
      );
      this.agentDispatchClient = new AgentDispatchClient(
        this.livekitUrl,
        this.livekitApiKey,
        this.livekitApiSecret,
      );
    }
  }

  async createRoom(roomName: string, metadata?: any): Promise<any> {
    try {
      this.logger.log(`Creating LiveKit room: ${roomName}`);

      if (!this.roomService) {
        throw new Error(
          'LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your .env file',
        );
      }

      const room = await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: 300, // 5 minutes
        maxParticipants: 2, // Only agent and debtor
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      this.logger.log(`Room created successfully: ${roomName}`);

      // Dispatch agent to the room
      await this.dispatchAgent(roomName, 'yoshlar_voice_agent');

      return room;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`);
      throw error;
    }
  }

  async dispatchAgent(roomName: string, agentName?: string): Promise<void> {
    try {
      const agent = agentName || 'yoshlar_voice_agent';
      this.logger.log(`Dispatching agent "${agent}" to room: ${roomName}`);

      if (!this.agentDispatchClient) {
        throw new Error('LiveKit is not configured');
      }

      // Create agent dispatch
      const dispatch = await this.agentDispatchClient.createDispatch(roomName, agent);
      this.logger.log(`Agent dispatched successfully to room: ${roomName} (dispatch ID: ${dispatch.id})`);
    } catch (error) {
      this.logger.error(`Failed to dispatch agent: ${error.message}`);
      // Don't throw - room is still created, just log the error
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      this.logger.log(`Deleting LiveKit room: ${roomName}`);

      if (!this.roomService) {
        this.logger.warn('LiveKit is not configured, skipping room deletion');
        return;
      }

      await this.roomService.deleteRoom(roomName);
      this.logger.log(`Room deleted: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to delete room: ${error.message}`);
      // Don't throw - room might already be deleted
    }
  }

  async sendDataToRoom(roomName: string, data: any, participantSid?: string): Promise<void> {
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
      
      // Log room metadata for debugging
      this.logger.log(`📝 Room metadata: ${room.metadata || 'No metadata'}`);
      
      const participants = await this.roomService.listParticipants(room.name);
      this.logger.log(`👥 Found ${participants.length} participants in room ${room.name}`);
      
      if (participants.length === 0) {
        this.logger.warn(`⚠️ No participants found in room ${room.name}`);
        return;
      }
      
      // Log participant details
      participants.forEach((p, i) => {
        this.logger.log(`👤 Participant ${i + 1}: ${p.identity} (SID: ${p.sid}, Joined: ${new Date(Number(p.joinedAt) * 1000).toISOString()})`
);
      });
      
      // Convert data to Uint8Array
      const dataStr = JSON.stringify(data);
      this.logger.log(`📝 Data to send (JSON): ${dataStr}`);
      
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataStr);
      this.logger.log(`📦 Data buffer length: ${dataBuffer.length} bytes`);
      
      let successCount = 0;
      
      for (const participant of participants) {
        // If participantSid is provided, only send to that participant
        if (participantSid && participant.sid !== participantSid) {
          this.logger.log(`⏭️  Skipping participant ${participant.identity} (${participant.sid}) - not the target`);
          continue;
        }
        
        this.logger.log(`📤 Sending data to participant ${participant.identity} (${participant.sid})`);
        
        try {
          // Log the exact data being sent
          this.logger.log(`📤 Sending data (${dataBuffer.length} bytes) to ${participant.identity}: ${dataStr}`);
          
          await this.roomService.sendData(
            room.name,
            dataBuffer,
            DataPacket_Kind.RELIABLE,
            { 
              destinationSids: [participant.sid],
              topic: 'phone-number' // Add topic for better filtering
            }
          );
          
          successCount++;
          this.logger.log(`✅ Successfully sent data to participant ${participant.identity} (${participant.sid})`);
        } catch (error) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send data to room: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async generateRoomToken(roomName: string, participantName: string): Promise<string> {
    const token = new AccessToken(
      this.livekitApiKey,
      this.livekitApiSecret,
      {
        identity: participantName,
      },
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return await token.toJwt();
  }

  async generateSipParticipantToken(
    roomName: string,
    participantIdentity: string,
    phoneNumber: string,
  ): Promise<string> {
    try {
      this.logger.log(`Generating SIP participant token for ${phoneNumber} in room ${roomName}`);

      if (!this.livekitApiKey || !this.livekitApiSecret) {
        throw new Error('LiveKit API credentials not configured');
      }

      const token = new AccessToken(
        this.livekitApiKey,
        this.livekitApiSecret,
        {
          identity: participantIdentity,
          name: `Debtor ${phoneNumber}`,
        },
      );

      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });

      const jwt = await token.toJwt();
      this.logger.log(`SIP token generated successfully for ${participantIdentity}`);

      return jwt;
    } catch (error) {
      this.logger.error(`Failed to generate SIP token: ${error.message}`);
      throw error;
    }
  }

  getRoomUrl(roomName: string): string {
    return `${this.livekitUrl}/${roomName}`;
  }

  async listParticipants(roomName: string): Promise<any[]> {
    try {
      if (!this.roomService) {
        this.logger.warn('LiveKit is not configured');
        return [];
      }

      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch (error) {
      this.logger.error(`Failed to list participants: ${error.message}`);
      return [];
    }
  }

  async removeParticipant(roomName: string, participantIdentity: string): Promise<void> {
    try {
      this.logger.log(`Removing participant ${participantIdentity} from room ${roomName}`);

      if (!this.roomService) {
        this.logger.warn('LiveKit is not configured, skipping participant removal');
        return;
      }

      await this.roomService.removeParticipant(roomName, participantIdentity);
    } catch (error) {
      this.logger.error(`Failed to remove participant: ${error.message}`);
    }
  }

  async updateRoomMetadata(roomName: string, metadata: string): Promise<void> {
    try {
      this.logger.log(`Updating room metadata for: ${roomName}`);

      if (!this.roomService) {
        throw new Error('LiveKit is not configured');
      }

      await this.roomService.updateRoomMetadata(roomName, metadata);
      this.logger.log(`Room metadata updated: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to update room metadata: ${error.message}`);
      throw error;
    }
  }
}
