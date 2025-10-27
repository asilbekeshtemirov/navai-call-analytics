var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DebtCollectionGateway_1;
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
let DebtCollectionGateway = DebtCollectionGateway_1 = class DebtCollectionGateway {
    server;
    logger = new Logger(DebtCollectionGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    emitCampaignUpdate(organizationId, data) {
        this.server.to(`org-${organizationId}`).emit('campaign-update', data);
        this.logger.debug(`Emitted campaign-update to org-${organizationId}:`, data);
    }
    emitCallInitiated(organizationId, data) {
        this.server.to(`org-${organizationId}`).emit('call-initiated', data);
        this.logger.debug(`Emitted call-initiated to org-${organizationId}:`, data);
    }
    emitCallCompleted(organizationId, data) {
        this.server.to(`org-${organizationId}`).emit('call-completed', data);
        this.logger.debug(`Emitted call-completed to org-${organizationId}:`, data);
    }
    joinOrganizationRoom(client, organizationId) {
        const room = `org-${organizationId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], DebtCollectionGateway.prototype, "server", void 0);
DebtCollectionGateway = DebtCollectionGateway_1 = __decorate([
    WebSocketGateway({
        namespace: 'debt-collection',
        cors: {
            origin: '*',
        },
    })
], DebtCollectionGateway);
export { DebtCollectionGateway };
//# sourceMappingURL=debt-collection.gateway.js.map