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
import { PromptService } from './prompt.service.js';
import { CreatePromptDto } from './dto/create-prompt.dto.js';
import { UpdatePromptDto } from './dto/update-prompt.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let PromptController = class PromptController {
    promptService;
    constructor(promptService) {
        this.promptService = promptService;
    }
    create(createPromptDto) {
        return this.promptService.create(createPromptDto);
    }
    findAll() {
        return this.promptService.findAll();
    }
    findOne(id) {
        return this.promptService.findOne(id);
    }
    update(id, updatePromptDto) {
        return this.promptService.update(id, updatePromptDto);
    }
    remove(id) {
        return this.promptService.remove(id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePromptDto]),
    __metadata("design:returntype", void 0)
], PromptController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromptController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromptController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePromptDto]),
    __metadata("design:returntype", void 0)
], PromptController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromptController.prototype, "remove", null);
PromptController = __decorate([
    ApiTags('prompts'),
    ApiBearerAuth('access-token'),
    Controller('prompts'),
    __metadata("design:paramtypes", [PromptService])
], PromptController);
export { PromptController };
//# sourceMappingURL=prompt.controller.js.map