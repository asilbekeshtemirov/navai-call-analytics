var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export var UserStatisticsType;
(function (UserStatisticsType) {
    UserStatisticsType["DAILY"] = "daily";
    UserStatisticsType["MONTHLY"] = "monthly";
    UserStatisticsType["SUMMARY"] = "summary";
    UserStatisticsType["ALL"] = "all";
})(UserStatisticsType || (UserStatisticsType = {}));
export class UnifiedUserStatisticsDto {
    type = UserStatisticsType.ALL;
    dateFrom;
    dateTo;
}
__decorate([
    ApiPropertyOptional({
        description: 'Type of statistics to retrieve',
        enum: UserStatisticsType,
        default: UserStatisticsType.ALL
    }),
    IsOptional(),
    IsEnum(UserStatisticsType),
    __metadata("design:type", String)
], UnifiedUserStatisticsDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Ixtiyoriy: Boshlanish sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)'
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UnifiedUserStatisticsDto.prototype, "dateFrom", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Ixtiyoriy: Tugash sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)'
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UnifiedUserStatisticsDto.prototype, "dateTo", void 0);
//# sourceMappingURL=unified-user-statistics.dto.js.map