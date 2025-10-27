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
import { Controller, Get, Post, Body, Param, NotFoundException, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { RecordOutcomeDto } from '../dto/call-outcome.dto.js';
let AgentApiController = class AgentApiController {
    contextBuilder;
    orchestrator;
    constructor(contextBuilder, orchestrator) {
        this.contextBuilder = contextBuilder;
        this.orchestrator = orchestrator;
    }
    async getContext(roomName) {
        const context = await this.contextBuilder.getContextByRoomName(roomName);
        if (!context) {
            throw new NotFoundException('Qo\'ng\'iroq konteksti topilmadi');
        }
        return context;
    }
    async getContextByPhone(phone) {
        const context = await this.contextBuilder.getContextByPhoneNumber(phone);
        if (!context) {
            throw new NotFoundException('Telefon raqami uchun kontekst topilmadi');
        }
        return context;
    }
    async recordOutcome(roomName, outcomeDto) {
        await this.orchestrator.handleCallCompletion(roomName, outcomeDto);
        return { message: 'Natija saqlandi' };
    }
    async recordPromise(roomName, data) {
        await this.orchestrator.handleCallCompletion(roomName, {
            outcome: 'PROMISE',
            promisedAmount: data.promisedAmount,
            promisedDate: data.promisedDate,
            notes: data.notes,
        });
        return { message: 'To\'lov vadasi saqlandi' };
    }
    async recordDispute(roomName, data) {
        await this.orchestrator.handleCallCompletion(roomName, {
            outcome: 'DISPUTED',
            notes: data.notes,
        });
        return { message: 'Nizo saqlandi' };
    }
    async addNote(roomName, data) {
        return { message: 'Eslatma saqlandi' };
    }
};
__decorate([
    Get(':roomName/context'),
    ApiOperation({ summary: 'Get call context for voice agent (called by agent)' }),
    __param(0, Param('roomName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "getContext", null);
__decorate([
    Get('phone/:phone/context'),
    ApiOperation({ summary: 'Get call context by phone number (for inbound calls)' }),
    __param(0, Param('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "getContextByPhone", null);
__decorate([
    Post(':roomName/outcome'),
    ApiOperation({ summary: 'Record call outcome (called by agent)' }),
    __param(0, Param('roomName')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RecordOutcomeDto]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "recordOutcome", null);
__decorate([
    Post(':roomName/promise'),
    ApiOperation({ summary: 'Record payment promise (called by agent)' }),
    __param(0, Param('roomName')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "recordPromise", null);
__decorate([
    Post(':roomName/dispute'),
    ApiOperation({ summary: 'Record dispute (called by agent)' }),
    __param(0, Param('roomName')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "recordDispute", null);
__decorate([
    Post(':roomName/note'),
    ApiOperation({ summary: 'Add call note (called by agent)' }),
    __param(0, Param('roomName')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgentApiController.prototype, "addNote", null);
AgentApiController = __decorate([
    ApiTags('Debt Collection - Agent API'),
    Controller('debt-collection/calls'),
    Public(),
    __metadata("design:paramtypes", [ContextBuilderService,
        CampaignOrchestratorService])
], AgentApiController);
export { AgentApiController };
//# sourceMappingURL=agent-api.controller.js.map