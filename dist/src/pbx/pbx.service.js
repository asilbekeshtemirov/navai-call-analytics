var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PbxService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { CallStatus } from '@prisma/client';
let PbxService = PbxService_1 = class PbxService {
    prisma;
    aiService;
    logger = new Logger(PbxService_1.name);
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async handleHistory(data) {
        try {
            const { callid, type, status, phone, user, start, duration, link, diversion, ext, } = data;
            const employee = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { extCode: user },
                        { extCode: ext },
                    ],
                },
            });
            if (!employee) {
                this.logger.warn(`Employee not found for extCode: ${user || ext}`);
                return { status: 'error', message: 'Employee not found' };
            }
            const callDate = new Date(start.replace('T', ' ').replace('Z', ''));
            const call = await this.prisma.call.upsert({
                where: { externalId: callid },
                update: {
                    status: status === 'Success' ? CallStatus.UPLOADED : CallStatus.ERROR,
                    durationSec: parseInt(duration) || 0,
                    fileUrl: link || null,
                },
                create: {
                    externalId: callid,
                    callerNumber: type === 'in' ? phone : diversion,
                    calleeNumber: type === 'in' ? diversion : phone,
                    callDate,
                    fileUrl: link || null,
                    status: status === 'Success' ? CallStatus.UPLOADED : CallStatus.ERROR,
                    durationSec: parseInt(duration) || 0,
                    employeeId: employee.id,
                },
            });
            this.logger.log(`Call saved: ${call.id}`);
            if (status === 'Success' && link && parseInt(duration) > 10) {
                this.aiService.processCall(call.id);
                this.logger.log(`Call ${call.id} sent for AI processing`);
            }
            return { status: 'success', call_id: call.id };
        }
        catch (error) {
            this.logger.error('Error handling history webhook:', error);
            return { status: 'error', message: error.message };
        }
    }
    async handleEvent(data) {
        try {
            const { callid, type, phone, user, direction, ext, } = data;
            this.logger.log(`Call event: ${type} for call ${callid}`);
            return { status: 'success' };
        }
        catch (error) {
            this.logger.error('Error handling event webhook:', error);
            return { status: 'error', message: error.message };
        }
    }
    async handleContact(data) {
        try {
            const { phone, callid } = data;
            return {
                contact_name: `Client ${phone}`,
                responsible: 'admin',
            };
        }
        catch (error) {
            this.logger.error('Error handling contact webhook:', error);
            return { status: 'error', message: error.message };
        }
    }
    async handleRating(data) {
        try {
            const { callid, rating, phone, user, ext } = data;
            const call = await this.prisma.call.findFirst({
                where: { externalId: callid },
            });
            if (call) {
                await this.prisma.call.update({
                    where: { id: call.id },
                    data: {
                        analysis: {
                            ...call.analysis,
                            customerRating: parseInt(rating),
                        },
                    },
                });
                this.logger.log(`Rating ${rating} saved for call ${callid}`);
            }
            return { status: 'success' };
        }
        catch (error) {
            this.logger.error('Error handling rating webhook:', error);
            return { status: 'error', message: error.message };
        }
    }
};
PbxService = PbxService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AiService])
], PbxService);
export { PbxService };
//# sourceMappingURL=pbx.service.js.map