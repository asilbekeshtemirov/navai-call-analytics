var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutoCallingGateway_1;
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
let AutoCallingGateway = AutoCallingGateway_1 = class AutoCallingGateway {
    server;
    logger = new Logger(AutoCallingGateway_1.name);
    afterInit(server) {
        this.logger.log('Auto-calling WebSocket Gateway initialized');
    }
    handleConnection(client, ...args) {
        const organizationId = client.handshake.query.organizationId;
        this.logger.log(`Client connected: ${client.id}, org: ${organizationId}`);
        if (organizationId) {
            client.join(`org-${organizationId}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    emitCampaignUpdate(organizationId, data) {
        this.server.to(`org-${organizationId}`).emit('campaign-update', data);
    }
    emitCampaignComplete(organizationId, campaignId) {
        this.server.to(`org-${organizationId}`).emit('campaign-complete', {
            campaignId,
            message: 'Campaign completed successfully',
        });
    }
    emitContactUpdate(organizationId, contactId, data) {
        this.server.to(`org-${organizationId}`).emit('contact-update', {
            contactId,
            ...data,
        });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], AutoCallingGateway.prototype, "server", void 0);
AutoCallingGateway = AutoCallingGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*',
        },
        namespace: '/auto-calling',
    })
], AutoCallingGateway);
export { AutoCallingGateway };
//# sourceMappingURL=auto-calling.gateway.js.map