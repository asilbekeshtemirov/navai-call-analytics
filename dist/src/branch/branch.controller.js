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
import { BranchService } from './branch.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
let BranchController = class BranchController {
    branchService;
    constructor(branchService) {
        this.branchService = branchService;
    }
    create(createBranchDto) {
        return this.branchService.create(createBranchDto);
    }
    findAll() {
        return this.branchService.findAll();
    }
    getManagers() {
        return this.branchService.getManagers();
    }
    findOne(id) {
        return this.branchService.findOne(id);
    }
    update(id, updateBranchDto) {
        return this.branchService.update(id, updateBranchDto);
    }
    remove(id) {
        return this.branchService.remove(id);
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Yangi filial yaratish' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBranchDto]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Barcha filiallarni olish' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "findAll", null);
__decorate([
    Get('managers'),
    ApiOperation({ summary: 'Barcha menejerlarni olish (dropdown uchun)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "getManagers", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Bitta filialni olish' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Filialni yangilash' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBranchDto]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: "Filialni o'chirish" }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "remove", null);
BranchController = __decorate([
    ApiTags('branches'),
    ApiBearerAuth('access-token'),
    Controller('branches'),
    __metadata("design:paramtypes", [BranchService])
], BranchController);
export { BranchController };
//# sourceMappingURL=branch.controller.js.map