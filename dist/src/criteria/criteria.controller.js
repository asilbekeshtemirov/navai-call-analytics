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
import { Controller, Get, Post, Body, Patch, Param, Delete, } from '@nestjs/common';
import { CriteriaService } from './criteria.service.js';
import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationId } from '../auth/organization-id.decorator.js';
let CriteriaController = class CriteriaController {
    criteriaService;
    constructor(criteriaService) {
        this.criteriaService = criteriaService;
    }
    create(organizationId, createCriteriaDto) {
        return this.criteriaService.create(organizationId, createCriteriaDto);
    }
    findAll(organizationId) {
        return this.criteriaService.findAll(organizationId);
    }
    findOne(organizationId, id) {
        return this.criteriaService.findOne(organizationId, id);
    }
    update(organizationId, id, updateCriteriaDto) {
        return this.criteriaService.update(organizationId, id, updateCriteriaDto);
    }
    remove(organizationId, id) {
        return this.criteriaService.remove(organizationId, id);
    }
};
__decorate([
    Post(),
    __param(0, OrganizationId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateCriteriaDto]),
    __metadata("design:returntype", void 0)
], CriteriaController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CriteriaController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, OrganizationId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], CriteriaController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, OrganizationId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, UpdateCriteriaDto]),
    __metadata("design:returntype", void 0)
], CriteriaController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, OrganizationId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], CriteriaController.prototype, "remove", null);
CriteriaController = __decorate([
    ApiTags('criteria'),
    ApiBearerAuth('access-token'),
    Controller('criteria'),
    __metadata("design:paramtypes", [CriteriaService])
], CriteriaController);
export { CriteriaController };
//# sourceMappingURL=criteria.controller.js.map