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
var PBXBridgeController_1;
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let PBXBridgeController = PBXBridgeController_1 = class PBXBridgeController {
    prisma;
    logger = new Logger(PBXBridgeController_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async lookupRoomByUser(data) {
        this.logger.log(`🔍 Room lookup request received`);
        this.logger.log(`📦 Request body: ${JSON.stringify(data)}`);
        if (!data || !data.user) {
            this.logger.error(`❌ Invalid request: missing user parameter`);
            return {
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing user parameter in request body'
            };
        }
        this.logger.log(`🔍 Looking up room for user: ${data.user}`);
        try {
            const assignment = await this.prisma.debtCampaignDebtor.findFirst({
                where: {
                    callStatus: 'CALLING',
                    liveKitRoomName: { not: null },
                },
                orderBy: { lastCallAt: 'desc' },
                include: {
                    debtor: true,
                },
            });
            if (!assignment) {
                this.logger.warn(`❌ No active room found for user: ${data.user}`);
                return {
                    success: false,
                    error: 'NO_ACTIVE_ROOM',
                    message: `No active call found for user ${data.user}`
                };
            }
            this.logger.log(`✅ Found room: ${assignment.liveKitRoomName} for debtor: ${assignment.debtor.firstName} ${assignment.debtor.lastName} (${assignment.debtor.phone})`);
            return {
                success: true,
                roomName: assignment.liveKitRoomName,
                debtorPhone: assignment.debtor.phone,
                debtorId: assignment.debtorId,
                debtorName: `${assignment.debtor.firstName} ${assignment.debtor.lastName}`,
                assignmentId: assignment.id,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error looking up room: ${error.message}`);
            this.logger.error(error.stack);
            return {
                success: false,
                error: 'LOOKUP_ERROR',
                message: error.message,
            };
        }
    }
};
__decorate([
    Post('lookup-room'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PBXBridgeController.prototype, "lookupRoomByUser", null);
PBXBridgeController = PBXBridgeController_1 = __decorate([
    Controller('pbx-bridge'),
    __metadata("design:paramtypes", [PrismaService])
], PBXBridgeController);
export { PBXBridgeController };
//# sourceMappingURL=pbx-bridge.controller.js.map