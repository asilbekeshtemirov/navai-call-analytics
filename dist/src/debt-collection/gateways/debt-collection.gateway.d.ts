import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class DebtCollectionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitCampaignUpdate(organizationId: number, data: any): void;
    emitCallInitiated(organizationId: number, data: any): void;
    emitCallCompleted(organizationId: number, data: any): void;
    joinOrganizationRoom(client: Socket, organizationId: number): void;
}
