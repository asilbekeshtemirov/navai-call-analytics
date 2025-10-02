var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class DashboardFilterDto {
    branchId;
    departmentId;
    employeeId;
    dateFrom;
    dateTo;
}
__decorate([
    ApiPropertyOptional({ description: 'Filter by branch ID' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DashboardFilterDto.prototype, "branchId", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter by department ID' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DashboardFilterDto.prototype, "departmentId", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter by employee ID' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DashboardFilterDto.prototype, "employeeId", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter from date (ISO 8601)' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], DashboardFilterDto.prototype, "dateFrom", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter to date (ISO 8601)' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], DashboardFilterDto.prototype, "dateTo", void 0);
//# sourceMappingURL=dashboard-filter.dto.js.map