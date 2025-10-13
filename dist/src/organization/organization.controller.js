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
import { Controller, Get, Post, Body, Param, Patch, UseGuards, } from '@nestjs/common';
import { OrganizationService } from './organization.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
let OrganizationController = class OrganizationController {
    organizationService;
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    create(createOrganizationDto) {
        return this.organizationService.create(createOrganizationDto);
    }
    findAll() {
        return this.organizationService.findAll();
    }
    findOne(id) {
        return this.organizationService.findOne(parseInt(id));
    }
    updateStatus(id, isActive) {
        return this.organizationService.updateStatus(parseInt(id), isActive);
    }
};
__decorate([
    Post(),
    Roles(UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'Yangi kompaniya yaratish (faqat SUPERADMIN)',
        description: "Yangi kompaniya, filial, bo'lim, admin foydalanuvchi va standart sozlamalarni yaratadi",
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrganizationDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "create", null);
__decorate([
    Get(),
    Roles(UserRole.SUPERADMIN),
    ApiOperation({ summary: "Barcha kompaniyalarni ko'rish (faqat SUPERADMIN)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles(UserRole.SUPERADMIN),
    ApiOperation({ summary: "Bitta kompaniyani ko'rish (faqat SUPERADMIN)" }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "findOne", null);
__decorate([
    Patch(':id/status'),
    Roles(UserRole.SUPERADMIN),
    ApiOperation({
        summary: "Kompaniya holatini o'zgartirish (faqat SUPERADMIN)",
    }),
    __param(0, Param('id')),
    __param(1, Body('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "updateStatus", null);
OrganizationController = __decorate([
    ApiTags('organizations'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('organizations'),
    __metadata("design:paramtypes", [OrganizationService])
], OrganizationController);
export { OrganizationController };
//# sourceMappingURL=organization.controller.js.map