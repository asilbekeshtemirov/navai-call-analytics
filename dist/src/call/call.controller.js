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
var CallController_1;
import { Controller, Get, Param, Query, Logger, UseGuards, Post, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { CallService } from './call.service.js';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Public } from '../auth/public.decorator.js';
export const numbersStorage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './numbers';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
});
let CallController = CallController_1 = class CallController {
    callService;
    logger = new Logger(CallController_1.name);
    constructor(callService) {
        this.callService = callService;
    }
    uploadFile(file) {
        return this.callService.uploadFile(file);
    }
    startProcess() {
        return this.callService.startProcess();
    }
    findAll(branchId, departmentId, employeeId, status, dateFrom, dateTo) {
        return this.callService.findAll({ branchId, departmentId, employeeId, status, dateFrom, dateTo });
    }
    findOne(id) {
        return this.callService.findOne(id);
    }
    getTranscript(id) {
        return this.callService.getTranscript(id);
    }
    getSessionStatus(sessionId) {
        return this.callService.getSessionStatus(sessionId);
    }
    getAllSessions(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.callService.getAllSessions(limitNum);
    }
};
__decorate([
    Public(),
    Post('upload'),
    ApiOperation({ summary: 'Upload .xlsx or .txt file' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        description: 'An .xlsx or .txt file containing numbers.',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    UseInterceptors(FileInterceptor('file', { storage: numbersStorage })),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "uploadFile", null);
__decorate([
    Public(),
    Post('start'),
    ApiOperation({ summary: 'Start remote process' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CallController.prototype, "startProcess", null);
__decorate([
    Get(),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
    ApiOperation({ summary: 'Get all calls with filters' }),
    ApiQuery({ name: 'branchId', required: false, description: "Ixtiyoriy: Filial ID si bo'yicha filter" }),
    ApiQuery({ name: 'departmentId', required: false, description: "Ixtiyoriy: Bo'lim ID si bo'yicha filter" }),
    ApiQuery({ name: 'employeeId', required: false, description: "Ixtiyoriy: Xodim ID si bo'yicha filter" }),
    ApiQuery({ name: 'status', required: false, description: "Ixtiyoriy: Qo'ng'iroq holati bo'yicha filter (UPLOADED, PROCESSING, DONE, ERROR)" }),
    ApiQuery({ name: 'dateFrom', required: false, description: 'Ixtiyoriy: Boshlanish sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)' }),
    ApiQuery({ name: 'dateTo', required: false, description: 'Ixtiyoriy: Tugash sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)' }),
    __param(0, Query('branchId')),
    __param(1, Query('departmentId')),
    __param(2, Query('employeeId')),
    __param(3, Query('status')),
    __param(4, Query('dateFrom')),
    __param(5, Query('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
    ApiOperation({ summary: 'Get call by ID with full details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "findOne", null);
__decorate([
    Get(':id/transcript'),
    Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
    ApiOperation({ summary: 'Get call transcript segments' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "getTranscript", null);
__decorate([
    Public(),
    Get('session/:sessionId'),
    ApiOperation({
        summary: 'Get call session status by session ID',
        description: `
      Bu endpoint orqali call session ning to'liq statusini olish mumkin.

      Response ma'lumotlari:
      - status: PENDING, RUNNING, COMPLETED, FAILED
      - progressPercentage: Jarayonning foizi (0-100%)
      - durationSeconds: Davomiyligi sekundlarda
      - statusDescription: O'zbekcha status tavsifi
      - totalNumbers, processedNumbers, connectedCalls, failedCalls: Statistika

      Real-time monitoring uchun har 3-5 sekundda polling qilish tavsiya etiladi.
    `
    }),
    __param(0, Param('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "getSessionStatus", null);
__decorate([
    Public(),
    Get('sessions/all'),
    ApiOperation({
        summary: 'Get all call sessions',
        description: `
      Barcha call sessionslar ro'yxatini olish.

      Har bir session uchun quyidagilar ko'rsatiladi:
      - Session ID va status
      - Progress foizi va davomiyligi
      - Statistika (total, processed, connected, failed)
      - Status tavsifi (o'zbekcha)

      Sessions eng yangilaridan eskilariga qarab tartiblangan.
    `
    }),
    ApiQuery({ name: 'limit', required: false, description: 'Limit the number of sessions returned (default: 50)' }),
    __param(0, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallController.prototype, "getAllSessions", null);
CallController = CallController_1 = __decorate([
    ApiTags('calls'),
    ApiBearerAuth('access-token'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('calls'),
    __metadata("design:paramtypes", [CallService])
], CallController);
export { CallController };
//# sourceMappingURL=call.controller.js.map