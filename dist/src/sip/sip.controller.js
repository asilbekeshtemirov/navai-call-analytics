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
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SipService } from './sip.service.js';
import { SipregsErrorDto } from './dto/sipregs-error.dto.js';
let SipController = class SipController {
    sipService;
    constructor(sipService) {
        this.sipService = sipService;
    }
    handleSipregsError(sipregsErrorDto) {
        return this.sipService.handleSipregsError(sipregsErrorDto);
    }
};
__decorate([
    Post('webhook'),
    HttpCode(HttpStatus.NO_CONTENT),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SipregsErrorDto]),
    __metadata("design:returntype", void 0)
], SipController.prototype, "handleSipregsError", null);
SipController = __decorate([
    Controller('sip'),
    __metadata("design:paramtypes", [SipService])
], SipController);
export { SipController };
//# sourceMappingURL=sip.controller.js.map