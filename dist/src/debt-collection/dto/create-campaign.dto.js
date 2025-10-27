var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateCampaignDto {
    name;
    description;
    dailyCallStartHour;
    dailyCallEndHour;
    maxCallsPerDay;
    debtorIds;
}
__decorate([
    ApiProperty({ example: 'Kuzgi qarz yig\'ish kampaniyasi' }),
    IsString(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Oktabr oyidagi qarzdorlar uchun' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ example: 9, default: 9, minimum: 0, maximum: 23 }),
    IsOptional(),
    IsInt(),
    Min(0),
    Max(23),
    __metadata("design:type", Number)
], CreateCampaignDto.prototype, "dailyCallStartHour", void 0);
__decorate([
    ApiPropertyOptional({ example: 18, default: 18, minimum: 0, maximum: 23 }),
    IsOptional(),
    IsInt(),
    Min(0),
    Max(23),
    __metadata("design:type", Number)
], CreateCampaignDto.prototype, "dailyCallEndHour", void 0);
__decorate([
    ApiPropertyOptional({ example: 100, default: 100 }),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateCampaignDto.prototype, "maxCallsPerDay", void 0);
__decorate([
    ApiProperty({
        example: ['uuid-1', 'uuid-2', 'uuid-3'],
        description: 'Array of debtor IDs to include in campaign'
    }),
    IsArray(),
    __metadata("design:type", Array)
], CreateCampaignDto.prototype, "debtorIds", void 0);
//# sourceMappingURL=create-campaign.dto.js.map