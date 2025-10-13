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
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UnifiedUserStatisticsDto } from './dto/unified-user-statistics.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    create(organizationId, createUserDto) {
        return this.userService.create(organizationId, createUserDto);
    }
    findAll(organizationId, branchId, departmentId) {
        return this.userService.findAll(organizationId, { branchId, departmentId });
    }
    async getUnifiedUserStatistics(id, filters) {
        return this.userService.getUnifiedUserStatistics(id, filters);
    }
    findOne(id) {
        return this.userService.findOneById(id);
    }
    update(id, updateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    remove(id) {
        return this.userService.remove(id);
    }
    async updateUserRole(id, updateUserRoleDto) {
        return this.userService.updateUserRole(id, updateUserRoleDto.role);
    }
};
__decorate([
    Post(),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    __param(0, OrganizationId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    Get(),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({ summary: "O'z organizatsiyasidagi barcha userlarni ko'rish" }),
    ApiQuery({ name: 'branchId', required: false }),
    ApiQuery({ name: 'departmentId', required: false }),
    __param(0, OrganizationId()),
    __param(1, Query('branchId')),
    __param(2, Query('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    Get(':id/statistics'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    ApiOperation({
        summary: 'Birlashtirilgan user statistika - barcha statistika turlarini bir joyda olish',
        description: "Bu endpoint orqali daily, monthly, summary ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
    }),
    __param(0, Param('id')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UnifiedUserStatisticsDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUnifiedUserStatistics", null);
__decorate([
    Get(':id'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    Patch(':id/role'),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    ApiOperation({ summary: 'Update user role' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserRole", null);
UserController = __decorate([
    ApiTags('users'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('users'),
    __metadata("design:paramtypes", [UserService])
], UserController);
export { UserController };
//# sourceMappingURL=user.controller.js.map