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
var SipuniController_1;
import { Controller, Post, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SipuniService } from './sipuni.service.js';
let SipuniController = SipuniController_1 = class SipuniController {
    sipuniService;
    logger = new Logger(SipuniController_1.name);
    constructor(sipuniService) {
        this.sipuniService = sipuniService;
    }
    async testConnection() {
        try {
            this.logger.log('[CONTROLLER] Testing Sipuni API connection');
            const result = await this.sipuniService.testConnection();
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
    async syncAndProcess(limit) {
        try {
            this.logger.log(`[CONTROLLER] Sync and process request: limit=${limit}`);
            const recordLimit = limit ? parseInt(limit) : 500;
            const result = await this.sipuniService.syncAndProcessRecordings(recordLimit);
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
};
__decorate([
    Get('test-connection'),
    ApiOperation({ summary: 'Test Sipuni API connection' }),
    ApiResponse({ status: 200, description: 'Connection test result' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "testConnection", null);
__decorate([
    Post('sync-and-process'),
    ApiOperation({ summary: 'Sipuni ma\'lumotlarini yuklab olib tahlil qilish (STT + AI)' }),
    ApiResponse({ status: 200, description: 'Sync and process completed' }),
    __param(0, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SipuniController.prototype, "syncAndProcess", null);
SipuniController = SipuniController_1 = __decorate([
    ApiTags('sipuni'),
    Controller('sipuni'),
    __metadata("design:paramtypes", [SipuniService])
], SipuniController);
export { SipuniController };
//# sourceMappingURL=sipuni.controller.js.map