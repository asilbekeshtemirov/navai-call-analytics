import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AutoCallingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    emitCampaignUpdate(organizationId: number, data: any): void;
    emitCampaignComplete(organizationId: number, campaignId: string): void;
    emitContactUpdate(organizationId: number, contactId: string, data: any): void;
}
