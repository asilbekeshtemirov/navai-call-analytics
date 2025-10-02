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
var CallController_1;
import { Controller, Get, Post, Body, Param, Query, Logger, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint, ApiBearerAuth } from '@nestjs/swagger';
import { CallService } from './call.service.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
let CallController = CallController_1 = class CallController {
    callService;
    logger = new Logger(CallController_1.name);
    constructor(callService) {
        this.callService = callService;
    }
    async handleVatsWebhook(body) {
        this.logger.log(`Received VATS webhook with command: ${body.cmd}`);
        switch (body.cmd) {
            case 'history':
                return this.callService.handleHistory(body);
            case 'event':
                return this.callService.handleEvent(body);
            case 'contact':
                return this.callService.handleContact(body);
            case 'rating':
                return this.callService.handleRating(body);
            default:
                this.logger.warn(`Unknown VATS command: ${body.cmd}`);
                return;
        }
    }
    uploadFromUrl(uploadFromUrlDto) {
        return this.callService.uploadFromUrl(uploadFromUrlDto);
    }
    findAll(branchId, departmentId, employeeId, status, dateFrom, dateTo) {
        return this.callService.findAll({
            branchId,
            departmentId,
            employeeId,
            status,
            dateFrom,
            dateTo,
        });
    }
    findOne(id) {
        return this.callService.findOne(id);
    }
    getTranscript(id) {
        return this.callService.getTranscript(id);
    }
};
__decorate([
    Post('vats'),
    ApiExcludeEndpoint(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "handleVatsWebhook", null);
__decorate([
    Post('upload-from-url'),
    ApiOperation({ summary: 'Upload call from URL' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadFromUrlDto]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "uploadFromUrl", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Get all calls with filters' }),
    __param(0, Query('branchId')),
    __param(1, Query('departmentId')),
    __param(2, Query('employeeId')),
    __param(3, Query('status')),
    __param(4, Query('dateFrom')),
    __param(5, Query('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get call by ID with full details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "findOne", null);
__decorate([
    Get(':id/transcript'),
    ApiOperation({ summary: 'Get call transcript segments' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "getTranscript", null);
CallController = CallController_1 = __decorate([
    ApiTags('calls'),
    ApiBearerAuth('access-token'),
    Controller('calls'),
    __metadata("design:paramtypes", [CallService])
], CallController);
export { CallController };
//# sourceMappingURL=call.controller.js.map