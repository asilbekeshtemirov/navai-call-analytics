import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/auto-calling',
})
export class AutoCallingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AutoCallingGateway.name);

  afterInit(server: Server) {
    this.logger.log('Auto-calling WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const organizationId = client.handshake.query.organizationId;
    this.logger.log(`Client connected: ${client.id}, org: ${organizationId}`);

    if (organizationId) {
      client.join(`org-${organizationId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitCampaignUpdate(organizationId: number, data: any) {
    this.server.to(`org-${organizationId}`).emit('campaign-update', data);
  }

  emitCampaignComplete(organizationId: number, campaignId: string) {
    this.server.to(`org-${organizationId}`).emit('campaign-complete', {
      campaignId,
      message: 'Campaign completed successfully',
    });
  }

  emitContactUpdate(organizationId: number, contactId: string, data: any) {
    this.server.to(`org-${organizationId}`).emit('contact-update', {
      contactId,
      ...data,
    });
  }
}
