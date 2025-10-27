import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LiveKitIntegrationService {
  private readonly logger = new Logger(LiveKitIntegrationService.name);
  private readonly livekitUrl: string;
  private readonly livekitApiKey: string;
  private readonly livekitApiSecret: string;
  private roomService: RoomServiceClient;

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
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`);
      throw error;
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
}
