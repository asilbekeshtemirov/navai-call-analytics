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
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromitService } from './promit.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
let PromitController = class PromitController {
    promitService;
    constructor(promitService) {
        this.promitService = promitService;
    }
    create(createPromitDto) {
        return this.promitService.create(createPromitDto);
    }
    findAll() {
        return this.promitService.findAll();
    }
    findOne(id) {
        return this.promitService.findOne(id);
    }
    update(id, updatePromitDto) {
        return this.promitService.update(id, updatePromitDto);
    }
    remove(id) {
        return this.promitService.remove(id);
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Yangi promit yaratish (faqat SuperAdmin)' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePromitDto]),
    __metadata("design:returntype", void 0)
], PromitController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Barcha promitlarni olish (faqat SuperAdmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromitController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Bitta promitni olish (faqat SuperAdmin)' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromitController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Promitni yangilash (faqat SuperAdmin)' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePromitDto]),
    __metadata("design:returntype", void 0)
], PromitController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Promitni o\'chirish (faqat SuperAdmin)' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromitController.prototype, "remove", null);
PromitController = __decorate([
    ApiTags('promit'),
    ApiBearerAuth('access-token'),
    Controller('promit'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [PromitService])
], PromitController);
export { PromitController };
//# sourceMappingURL=promit.controller.js.map