var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '@prisma/client';
export class CreateCampaignDto {
    name;
    description;
    campaignType;
    contactIds;
}
__decorate([
    ApiProperty({ example: 'Monthly Debt Collection Campaign' }),
    IsString(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Calling all debtors with overdue payments' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ enum: CampaignType, example: CampaignType.DEBT_COLLECTION }),
    IsEnum(CampaignType),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "campaignType", void 0);
__decorate([
    ApiPropertyOptional({
        example: ['uuid-1', 'uuid-2', 'uuid-3'],
        description: 'Array of contact IDs to include in campaign'
    }),
    IsOptional(),
    IsArray(),
    IsUUID('4', { each: true }),
    __metadata("design:type", Array)
], CreateCampaignDto.prototype, "contactIds", void 0);
//# sourceMappingURL=create-campaign.dto.js.map