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
var PbxController_1;
import { Controller, Post, Body, Logger, Headers } from '@nestjs/common';
import { PbxService } from './pbx.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
let PbxController = PbxController_1 = class PbxController {
    pbxService;
    logger = new Logger(PbxController_1.name);
    constructor(pbxService) {
        this.pbxService = pbxService;
    }
    async handleHistory(data, headers) {
        this.logger.log('History webhook received:', JSON.stringify(data));
        if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
            this.logger.warn('Invalid CRM token');
            return { status: 'error', message: 'Invalid token' };
        }
        return this.pbxService.handleHistory(data);
    }
    async handleEvent(data, headers) {
        this.logger.log('Event webhook received:', JSON.stringify(data));
        if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
            this.logger.warn('Invalid CRM token');
            return { status: 'error', message: 'Invalid token' };
        }
        return this.pbxService.handleEvent(data);
    }
    async handleContact(data, headers) {
        this.logger.log('Contact webhook received:', JSON.stringify(data));
        if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
            this.logger.warn('Invalid CRM token');
            return { status: 'error', message: 'Invalid token' };
        }
        return this.pbxService.handleContact(data);
    }
    async handleRating(data, headers) {
        this.logger.log('Rating webhook received:', JSON.stringify(data));
        if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
            this.logger.warn('Invalid CRM token');
            return { status: 'error', message: 'Invalid token' };
        }
        return this.pbxService.handleRating(data);
    }
};
__decorate([
    Post('history'),
    ApiOperation({
        summary: "PBX history webhook - qo'ng'iroq tugagandan keyin",
    }),
    __param(0, Body()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PbxController.prototype, "handleHistory", null);
__decorate([
    Post('event'),
    ApiOperation({ summary: "PBX event webhook - qo'ng'iroq jarayoni" }),
    __param(0, Body()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PbxController.prototype, "handleEvent", null);
__decorate([
    Post('contact'),
    ApiOperation({
        summary: "PBX contact webhook - mijoz ma'lumotlarini so'rash",
    }),
    __param(0, Body()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PbxController.prototype, "handleContact", null);
__decorate([
    Post('rating'),
    ApiOperation({ summary: 'PBX rating webhook - mijoz bahosi' }),
    __param(0, Body()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PbxController.prototype, "handleRating", null);
PbxController = PbxController_1 = __decorate([
    ApiTags('pbx'),
    Controller('pbx'),
    __metadata("design:paramtypes", [PbxService])
], PbxController);
export { PbxController };
//# sourceMappingURL=pbx.controller.js.map