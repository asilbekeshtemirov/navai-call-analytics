import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'debt-collection',
  cors: {
    origin: '*',
  },
})
export class DebtCollectionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DebtCollectionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitCampaignUpdate(organizationId: number, data: any) {
    this.server.to(`org-${organizationId}`).emit('campaign-update', data);
    this.logger.debug(`Emitted campaign-update to org-${organizationId}:`, data);
  }

  emitCallInitiated(organizationId: number, data: any) {
    this.server.to(`org-${organizationId}`).emit('call-initiated', data);
    this.logger.debug(`Emitted call-initiated to org-${organizationId}:`, data);
  }

  emitCallCompleted(organizationId: number, data: any) {
    this.server.to(`org-${organizationId}`).emit('call-completed', data);
    this.logger.debug(`Emitted call-completed to org-${organizationId}:`, data);
  }

  joinOrganizationRoom(client: Socket, organizationId: number) {
    const room = `org-${organizationId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }
}
