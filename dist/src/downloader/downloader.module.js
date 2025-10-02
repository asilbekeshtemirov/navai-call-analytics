var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { DownloaderService } from './downloader.service.js';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from '../ai/ai.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DownloaderController } from './downloader.controller.js';
let DownloaderModule = class DownloaderModule {
};
DownloaderModule = __decorate([
    Module({
        imports: [HttpModule, AiModule, PrismaModule],
        providers: [DownloaderService],
        controllers: [DownloaderController],
    })
], DownloaderModule);
export { DownloaderModule };
//# sourceMappingURL=downloader.module.js.map