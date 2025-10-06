var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export var StatisticsType;
(function (StatisticsType) {
    StatisticsType["OVERVIEW"] = "overview";
    StatisticsType["DAILY"] = "daily";
    StatisticsType["MONTHLY"] = "monthly";
    StatisticsType["DASHBOARD"] = "dashboard";
    StatisticsType["SIPUNI"] = "sipuni";
    StatisticsType["ALL"] = "all";
})(StatisticsType || (StatisticsType = {}));
export class UnifiedStatisticsDto {
    type = StatisticsType.ALL;
    dateFrom;
    dateTo;
    extCode;
    employeeId;
    departmentId;
    branchId;
}
__decorate([
    ApiPropertyOptional({
        description: 'Type of statistics to retrieve',
        enum: StatisticsType,
        default: StatisticsType.ALL,
    }),
    IsOptional(),
    IsEnum(StatisticsType),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Start date for filtering (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "dateFrom", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'End date for filtering (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "dateTo", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Filter by employee extension code',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "extCode", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Filter by employee ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "employeeId", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Filter by department ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "departmentId", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Filter by branch ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UnifiedStatisticsDto.prototype, "branchId", void 0);
//# sourceMappingURL=unified-statistics.dto.js.map