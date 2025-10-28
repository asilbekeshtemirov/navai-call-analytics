import { ConfigService } from '@nestjs/config';
export declare class LiveKitIntegrationService {
    private configService;
    private readonly logger;
    private readonly livekitUrl;
    private readonly livekitApiKey;
    private readonly livekitApiSecret;
    private roomService;
    private agentDispatchClient;
    constructor(configService: ConfigService);
    createRoom(roomName: string, metadata?: any): Promise<any>;
    dispatchAgent(roomName: string, agentName?: string): Promise<void>;
    deleteRoom(roomName: string): Promise<void>;
    sendDataToRoom(roomName: string, data: any, participantSid?: string): Promise<void>;
    generateRoomToken(roomName: string, participantName: string): Promise<string>;
    getRoomUrl(roomName: string): string;
    listParticipants(roomName: string): Promise<any[]>;
    removeParticipant(roomName: string, participantIdentity: string): Promise<void>;
    updateRoomMetadata(roomName: string, metadata: string): Promise<void>;
}
