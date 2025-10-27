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
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { OrganizationId } from '../../auth/organization-id.decorator.js';
import { CampaignService } from '../services/campaign.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { CreateCampaignDto } from '../dto/create-campaign.dto.js';
import { UserRole } from '@prisma/client';
let CampaignsController = class CampaignsController {
    campaignService;
    orchestratorService;
    constructor(campaignService, orchestratorService) {
        this.campaignService = campaignService;
        this.orchestratorService = orchestratorService;
    }
    create(organizationId, createCampaignDto, req) {
        const userId = req.user?.sub;
        return this.campaignService.create(organizationId, createCampaignDto, userId);
    }
    findAll(organizationId) {
        return this.campaignService.findAll(organizationId);
    }
    findOne(id, organizationId) {
        return this.campaignService.findOne(id, organizationId);
    }
    getProgress(id, organizationId) {
        return this.campaignService.getProgress(id, organizationId);
    }
    async start(id, organizationId) {
        await this.orchestratorService.startCampaign(id, organizationId);
        return { message: 'Kampaniya boshlandi' };
    }
    async pause(id, organizationId) {
        await this.orchestratorService.pauseCampaign(id, organizationId);
        return { message: 'Kampaniya to\'xtatildi' };
    }
    async resume(id, organizationId) {
        await this.orchestratorService.resumeCampaign(id, organizationId);
        return { message: 'Kampaniya davom ettirildi' };
    }
    async stop(id, organizationId) {
        await this.orchestratorService.stopCampaign(id, organizationId);
        return { message: 'Kampaniya to\'xtatildi' };
    }
    remove(id, organizationId) {
        return this.campaignService.delete(id, organizationId);
    }
};
__decorate([
    Post(),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Create new campaign' }),
    __param(0, OrganizationId()),
    __param(1, Body()),
    __param(2, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateCampaignDto, Object]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "create", null);
__decorate([
    Get(),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Get all campaigns' }),
    __param(0, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Get campaign by ID' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "findOne", null);
__decorate([
    Get(':id/progress'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Get campaign progress' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "getProgress", null);
__decorate([
    Post(':id/start'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Start campaign' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "start", null);
__decorate([
    Post(':id/pause'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Pause campaign' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "pause", null);
__decorate([
    Post(':id/resume'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Resume campaign' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "resume", null);
__decorate([
    Post(':id/stop'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Stop campaign' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "stop", null);
__decorate([
    Delete(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({ summary: 'Delete campaign' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "remove", null);
CampaignsController = __decorate([
    ApiTags('Debt Collection - Campaigns'),
    Controller('debt-collection/campaigns'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    __metadata("design:paramtypes", [CampaignService,
        CampaignOrchestratorService])
], CampaignsController);
export { CampaignsController };
//# sourceMappingURL=campaigns.controller.js.map