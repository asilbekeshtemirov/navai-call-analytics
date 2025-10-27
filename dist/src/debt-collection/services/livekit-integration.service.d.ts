import { ConfigService } from '@nestjs/config';
export declare class LiveKitIntegrationService {
    private configService;
    private readonly logger;
    private readonly livekitUrl;
    private readonly livekitApiKey;
    private readonly livekitApiSecret;
    private roomService;
    constructor(configService: ConfigService);
    createRoom(roomName: string, metadata?: any): Promise<any>;
    deleteRoom(roomName: string): Promise<void>;
    generateRoomToken(roomName: string, participantName: string): Promise<string>;
    getRoomUrl(roomName: string): string;
    listParticipants(roomName: string): Promise<any[]>;
    removeParticipant(roomName: string, participantIdentity: string): Promise<void>;
}
