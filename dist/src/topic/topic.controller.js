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
import { TopicService } from './topic.service.js';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let TopicController = class TopicController {
    topicService;
    constructor(topicService) {
        this.topicService = topicService;
    }
    create(createTopicDto) {
        return this.topicService.create(createTopicDto);
    }
    findAll() {
        return this.topicService.findAll();
    }
    findOne(id) {
        return this.topicService.findOne(id);
    }
    update(id, updateTopicDto) {
        return this.topicService.update(id, updateTopicDto);
    }
    remove(id) {
        return this.topicService.remove(id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTopicDto]),
    __metadata("design:returntype", void 0)
], TopicController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TopicController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TopicController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTopicDto]),
    __metadata("design:returntype", void 0)
], TopicController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TopicController.prototype, "remove", null);
TopicController = __decorate([
    ApiTags('topics'),
    ApiBearerAuth('access-token'),
    Controller('topics'),
    __metadata("design:paramtypes", [TopicService])
], TopicController);
export { TopicController };
//# sourceMappingURL=topic.controller.js.map