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
import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    get(organizationId) {
        return this.settingsService.get(organizationId);
    }
    update(organizationId, updateSettingsDto) {
        return this.settingsService.update(organizationId, updateSettingsDto);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Get system settings' }),
    __param(0, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "get", null);
__decorate([
    Patch(),
    ApiOperation({ summary: 'Update system settings' }),
    __param(0, OrganizationId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "update", null);
SettingsController = __decorate([
    ApiTags('settings'),
    ApiBearerAuth('access-token'),
    Controller('settings'),
    __metadata("design:paramtypes", [SettingsService])
], SettingsController);
export { SettingsController };
//# sourceMappingURL=settings.controller.js.map