var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/public.decorator.js';
import { AiService } from './ai/ai.service.js';
let AppController = class AppController {
    appService;
    aiService;
    constructor(appService, aiService) {
        this.appService = appService;
        this.aiService = aiService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async testLlm() {
        const prompt = 'Explain how AI works in a few words';
        return this.appService.getLlmResponse(prompt);
    }
    async processAllCalls() {
        await this.aiService.processAllUploadedCalls();
        return { message: 'All uploaded calls processing started' };
    }
    async reprocessErrorCalls() {
        const errorCalls = await this.aiService['prisma'].call.findMany({
            where: { status: 'ERROR' }
        });
        for (const call of errorCalls) {
            await this.aiService['prisma'].call.update({
                where: { id: call.id },
                data: { status: 'UPLOADED' }
            });
        }
        await this.aiService.processAllUploadedCalls();
        return { message: `Reset ${errorCalls.length} error calls and started reprocessing` };
    }
    async resetStuckCalls() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const stuckCalls = await this.aiService['prisma'].call.findMany({
            where: {
                status: 'PROCESSING',
                createdAt: { lt: tenMinutesAgo }
            }
        });
        for (const call of stuckCalls) {
            await this.aiService['prisma'].call.update({
                where: { id: call.id },
                data: { status: 'UPLOADED' }
            });
        }
        return { message: `Reset ${stuckCalls.length} stuck calls to UPLOADED status` };
    }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    Public(),
    Get('test-llm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testLlm", null);
__decorate([
    Public(),
    Get('process-all-calls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "processAllCalls", null);
__decorate([
    Public(),
    Get('reprocess-error-calls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "reprocessErrorCalls", null);
__decorate([
    Public(),
    Get('reset-stuck-calls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "resetStuckCalls", null);
AppController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AppService,
        AiService])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map