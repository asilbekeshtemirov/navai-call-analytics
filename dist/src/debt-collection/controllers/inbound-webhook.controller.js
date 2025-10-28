var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InboundWebhookController_1;
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { LiveKitIntegrationService } from '../services/livekit-integration.service.js';
let InboundWebhookController = InboundWebhookController_1 = class InboundWebhookController {
    contextBuilder;
    livekitService;
    logger = new Logger(InboundWebhookController_1.name);
    constructor(contextBuilder, livekitService) {
        this.contextBuilder = contextBuilder;
        this.livekitService = livekitService;
    }
    async handleInboundCallStarted(data) {
        try {
            this.logger.log(`Inbound call started from ${data.phone} to room ${data.roomName}`);
            const phoneDigits = data.phone.replace(/\D/g, '');
            const context = await this.contextBuilder.getContextByPhoneNumber(phoneDigits);
            if (!context) {
                this.logger.warn(`No debtor found for phone: ${phoneDigits}`);
                return {
                    success: false,
                    message: 'Qarzdor topilmadi',
                };
            }
            try {
                try {
                    const phoneData = {
                        type: 'phone-number',
                        phone: phoneDigits,
                        timestamp: new Date().toISOString()
                    };
                    this.logger.log(`Sending phone number data to room ${data.roomName}:`, JSON.stringify(phoneData, null, 2));
                    await this.livekitService.sendDataToRoom(data.roomName, phoneData);
                    this.logger.log(`Successfully sent phone number ${phoneDigits} to room ${data.roomName}`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error(`Failed to send phone number to room: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
                }
                await this.livekitService.updateRoomMetadata(data.roomName, JSON.stringify({
                    ...context,
                    phoneNumber: phoneDigits,
                    updatedAt: new Date().toISOString()
                }));
                this.logger.log(`Room ${data.roomName} updated with debt context for ${context.debtor.firstName} ${context.debtor.lastName}`);
            }
            catch (error) {
                this.logger.error(`Failed to update room metadata: ${error.message}`);
            }
            return {
                success: true,
                message: 'Context created and room updated',
                debtor: {
                    id: context.debtor.id,
                    name: `${context.debtor.firstName} ${context.debtor.lastName}`,
                },
                debt: {
                    amount: context.debt.amount,
                    currency: context.debt.currency,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error handling inbound call: ${error.message}`);
            return {
                success: false,
                message: error.message,
            };
        }
    }
};
__decorate([
    Post('call-started'),
    ApiOperation({ summary: 'Webhook called when inbound call starts (from PBX or LiveKit SIP)' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InboundWebhookController.prototype, "handleInboundCallStarted", null);
InboundWebhookController = InboundWebhookController_1 = __decorate([
    ApiTags('Debt Collection - Inbound Calls'),
    Controller('debt-collection/inbound'),
    Public(),
    __metadata("design:paramtypes", [ContextBuilderService,
        LiveKitIntegrationService])
], InboundWebhookController);
export { InboundWebhookController };
//# sourceMappingURL=inbound-webhook.controller.js.map