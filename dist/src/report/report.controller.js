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
import { Controller, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let ReportController = class ReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    create(generateReportDto) {
        return this.reportService.generate(generateReportDto);
    }
};
__decorate([
    Post('generate'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateReportDto]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "create", null);
ReportController = __decorate([
    ApiTags('reports'),
    ApiBearerAuth('access-token'),
    Controller('reports'),
    __metadata("design:paramtypes", [ReportService])
], ReportController);
export { ReportController };
//# sourceMappingURL=report.controller.js.map