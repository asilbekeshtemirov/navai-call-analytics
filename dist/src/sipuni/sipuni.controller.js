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
var SipuniController_1, SipuniWebhookController_1;
import { Controller, Post, Get, Query, Logger, UseGuards, Headers, UnauthorizedException, Body, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, } from '@nestjs/swagger';
import { SipuniService } from './sipuni.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { OrganizationId } from '../auth/organization-id.decorator.js';
import { ConfigService } from '@nestjs/config';
let SipuniController = SipuniController_1 = class SipuniController {
    sipuniService;
    config;
    logger = new Logger(SipuniController_1.name);
    constructor(sipuniService, config) {
        this.sipuniService = sipuniService;
        this.config = config;
    }
    async testConnection(organizationId) {
        try {
            this.logger.log(`[CONTROLLER] Testing Sipuni API connection for org ${organizationId}`);
            const result = await this.sipuniService.testConnection(organizationId);
            return {
                success: true,
                message: 'Sipuni service is initialized and ready',
                config: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] Connection test failed: ${error.message}`);
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async syncAndProcess(organizationId, limit, from, to) {
        try {
            this.logger.log(`[CONTROLLER] Sync and process request for org ${organizationId}: limit=${limit}, from=${from}, to=${to}`);
            const recordLimit = limit ? parseInt(limit) : 500;
            const result = await this.sipuniService.syncAndProcessRecordings(organizationId, recordLimit, from, to);
            return result;
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] Sync and process failed: ${error.message}`);
            return {
                success: false,
                message: `Sync and process failed: ${error.message}`,
                recordsProcessed: 0,
            };
        }
    }
    async step1FetchCSV(organizationId, limit) {
        try {
            this.logger.log(`[CONTROLLER] Step 1: Fetching CSV for org ${organizationId}, limit=${limit}`);
            const recordLimit = limit ? parseInt(limit) : 500;
            const result = await this.sipuniService.step1FetchAndSaveCSV(organizationId, recordLimit);
            return result;
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] Step 1 failed: ${error.message}`);
            return {
                success: false,
                message: `Step 1 failed: ${error.message}`,
                totalRecords: 0,
                csvPath: '',
            };
        }
    }
    async step2ProcessRecordings(organizationId, from, to) {
        try {
            this.logger.log(`[CONTROLLER] Step 2: Processing recordings for org ${organizationId}, from=${from}, to=${to}`);
            const result = await this.sipuniService.step2ProcessCSVAndDownloadRecordings(organizationId, from, to);
            return result;
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] Step 2 failed: ${error.message}`);
            return {
                success: false,
                message: `Step 2 failed: ${error.message}`,
                recordsProcessed: 0,
            };
        }
    }
    async updateMissingDurations(organizationId) {
        try {
            this.logger.log(`[CONTROLLER] Updating missing durations for org ${organizationId}`);
            const result = await this.sipuniService.updateMissingDurations(organizationId);
            return result;
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] Update missing durations failed: ${error.message}`);
            return {
                success: false,
                message: `Update failed: ${error.message}`,
                updated: 0,
            };
        }
    }
};
__decorate([
    Get('test-connection'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'Test Sipuni API connection (ADMIN & SUPERADMIN only)',
    }),
    ApiResponse({ status: 200, description: 'Connection test result' }),
    __param(0, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "testConnection", null);
__decorate([
    Post('sync-and-process'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({
        summary: "Sipuni ma'lumotlarini yuklab olib tahlil qilish (STT + AI) - ADMIN & SUPERADMIN only",
        description: 'from va to parametrlari: DD.MM.YYYY formatida (masalan: 01.10.2025)',
    }),
    ApiResponse({ status: 200, description: 'Sync and process completed' }),
    __param(0, OrganizationId()),
    __param(1, Query('limit')),
    __param(2, Query('from')),
    __param(3, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "syncAndProcess", null);
__decorate([
    Post('step1-fetch-csv'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'STEP 1: Sipuni API dan CSV faylni yuklash',
        description: 'Sipuni API dan barcha qo\'ng\'iroqlarni oladi va CSV faylga saqlaydi',
    }),
    ApiResponse({ status: 200, description: 'CSV successfully fetched and saved' }),
    __param(0, OrganizationId()),
    __param(1, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "step1FetchCSV", null);
__decorate([
    Post('step2-process-recordings'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'STEP 2: CSV fayldan ma\'lumotlarni o\'qish va recordinglarni yuklash',
        description: 'CSV fayldan qo\'ng\'iroqlarni o\'qiydi, recording fayllarni yuklaydi va DB ga saqlaydi. from va to parametrlari: DD.MM.YYYY formatida',
    }),
    ApiResponse({ status: 200, description: 'Recordings successfully processed' }),
    __param(0, OrganizationId()),
    __param(1, Query('from')),
    __param(2, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "step2ProcessRecordings", null);
__decorate([
    Post('update-missing-durations'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'Update missing call durations from Sipuni',
        description: 'Sipuni API dan yangi ma\'lumotlarni olib, durationSec = 0 yoki null bo\'lgan qo\'ng\'iroqlarni yangilaydi',
    }),
    ApiResponse({
        status: 200,
        description: 'Successfully updated missing durations',
    }),
    __param(0, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "updateMissingDurations", null);
SipuniController = SipuniController_1 = __decorate([
    ApiTags('sipuni'),
    Controller('sipuni'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    __metadata("design:paramtypes", [SipuniService,
        ConfigService])
], SipuniController);
export { SipuniController };
let SipuniWebhookController = SipuniWebhookController_1 = class SipuniWebhookController {
    sipuniService;
    config;
    logger = new Logger(SipuniWebhookController_1.name);
    constructor(sipuniService, config) {
        this.sipuniService = sipuniService;
        this.config = config;
    }
    async handleWebhook(apiKey, body) {
        const validApiKey = this.config.get('SIPUNI_WEBHOOK_API_KEY') || 'default-secret-key';
        if (!apiKey || apiKey !== validApiKey) {
            this.logger.warn('[WEBHOOK] Invalid API key attempt');
            throw new UnauthorizedException('Invalid API Key');
        }
        const organizationId = body.organizationId || 1;
        const limit = body.limit || 500;
        const from = body.from;
        const to = body.to;
        try {
            this.logger.log(`[WEBHOOK] Sync request received for org ${organizationId}: limit=${limit}, from=${from}, to=${to}`);
            const result = await this.sipuniService.syncAndProcessRecordings(organizationId, limit, from, to);
            return {
                success: true,
                message: 'Sync started successfully',
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`[WEBHOOK] Sync failed: ${error.message}`);
            return {
                success: false,
                message: `Sync failed: ${error.message}`,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
__decorate([
    Post(),
    ApiOperation({
        summary: 'Webhook endpoint for Sipuni integration',
        description: 'Public endpoint protected by API key. Requires X-API-Key header.',
    }),
    ApiHeader({
        name: 'X-API-Key',
        description: 'API Key for authentication',
        required: true,
    }),
    ApiResponse({ status: 200, description: 'Sync started successfully' }),
    ApiResponse({ status: 401, description: 'Invalid API Key' }),
    __param(0, Headers('x-api-key')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SipuniWebhookController.prototype, "handleWebhook", null);
SipuniWebhookController = SipuniWebhookController_1 = __decorate([
    ApiTags('sipuni-webhook'),
    Controller('sipuni-integration'),
    __metadata("design:paramtypes", [SipuniService,
        ConfigService])
], SipuniWebhookController);
export { SipuniWebhookController };
//# sourceMappingURL=sipuni.controller.js.map