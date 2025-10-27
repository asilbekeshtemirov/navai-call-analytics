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
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { OrganizationId } from '../../auth/organization-id.decorator.js';
import { DebtorService } from '../services/debtor.service.js';
import { CreateDebtorDto } from '../dto/create-debtor.dto.js';
import { UpdateDebtorDto } from '../dto/update-debtor.dto.js';
import { UserRole } from '@prisma/client';
let DebtorsController = class DebtorsController {
    debtorService;
    constructor(debtorService) {
        this.debtorService = debtorService;
    }
    create(organizationId, createDebtorDto) {
        return this.debtorService.create(organizationId, createDebtorDto);
    }
    async bulkImport(organizationId, file) {
        return this.debtorService.bulkImport(organizationId, file);
    }
    findAll(organizationId, status, search, limit, skip) {
        const filters = {
            status,
            search,
            limit: limit ? parseInt(limit, 10) : 50,
            skip: skip ? parseInt(skip, 10) : 0,
        };
        return this.debtorService.findAll(organizationId, filters);
    }
    findOne(id, organizationId) {
        return this.debtorService.findOne(id, organizationId);
    }
    update(id, organizationId, updateDebtorDto) {
        return this.debtorService.update(id, organizationId, updateDebtorDto);
    }
    remove(id, organizationId) {
        return this.debtorService.remove(id, organizationId);
    }
};
__decorate([
    Post(),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Create new debtor' }),
    __param(0, OrganizationId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateDebtorDto]),
    __metadata("design:returntype", void 0)
], DebtorsController.prototype, "create", null);
__decorate([
    Post('bulk-import'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({ summary: 'Bulk import debtors from Excel file' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Excel file (.xlsx) containing debtor information',
                },
            },
        },
    }),
    UseInterceptors(FileInterceptor('file')),
    __param(0, OrganizationId()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DebtorsController.prototype, "bulkImport", null);
__decorate([
    Get(),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Get all debtors with filters' }),
    ApiQuery({ name: 'status', required: false, description: 'Filter by debtor status' }),
    ApiQuery({ name: 'search', required: false, description: 'Search by name, phone, or email' }),
    ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 50)' }),
    ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip (default: 0)' }),
    __param(0, OrganizationId()),
    __param(1, Query('status')),
    __param(2, Query('search')),
    __param(3, Query('limit')),
    __param(4, Query('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", void 0)
], DebtorsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Get debtor by ID' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], DebtorsController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER),
    ApiOperation({ summary: 'Update debtor' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, UpdateDebtorDto]),
    __metadata("design:returntype", void 0)
], DebtorsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({ summary: 'Delete debtor' }),
    __param(0, Param('id')),
    __param(1, OrganizationId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], DebtorsController.prototype, "remove", null);
DebtorsController = __decorate([
    ApiTags('Debt Collection - Debtors'),
    Controller('debt-collection/debtors'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    __metadata("design:paramtypes", [DebtorService])
], DebtorsController);
export { DebtorsController };
//# sourceMappingURL=debtors.controller.js.map