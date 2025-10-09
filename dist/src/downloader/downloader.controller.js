var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Post, UseGuards } from '@nestjs/common';
import { DownloaderService } from './downloader.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let DownloaderController = class DownloaderController {
    downloaderService;
    constructor(downloaderService) {
        this.downloaderService = downloaderService;
    }
    async triggerDownload() {
        this.downloaderService['downloadAndProcessCalls']();
        return { message: 'Download process triggered successfully.' };
    }
};
__decorate([
    Post('trigger'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DownloaderController.prototype, "triggerDownload", null);
DownloaderController = __decorate([
    ApiTags('downloader'),
    ApiBearerAuth('access-token'),
    Controller('downloader'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ADMIN, UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [DownloaderService])
], DownloaderController);
export { DownloaderController };
//# sourceMappingURL=downloader.controller.js.map