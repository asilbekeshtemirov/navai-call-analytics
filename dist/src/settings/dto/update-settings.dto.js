var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
var ScoringMode;
(function (ScoringMode) {
    ScoringMode["TEN"] = "TEN";
    ScoringMode["HUNDRED"] = "HUNDRED";
})(ScoringMode || (ScoringMode = {}));
var DataSource;
(function (DataSource) {
    DataSource["PBX"] = "PBX";
    DataSource["SIPUNI"] = "SIPUNI";
})(DataSource || (DataSource = {}));
export class UpdateSettingsDto {
    analyticsStatus;
    scoringMode;
    excludeSeconds;
    pbxUrl;
    language;
    sipApiUrl;
    sipApiKey;
    sttApiUrl;
    geminiApiKey;
    sipuniApiUrl;
    sipuniApiKey;
    sipuniUserId;
    dataSource;
}
__decorate([
    ApiPropertyOptional({ description: 'Enable/disable analytics' }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "analyticsStatus", void 0);
__decorate([
    ApiPropertyOptional({
        enum: ScoringMode,
        description: 'Scoring mode: 10 or 100 point scale',
    }),
    IsOptional(),
    IsEnum(ScoringMode),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "scoringMode", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Exclude first N seconds from analysis' }),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "excludeSeconds", void 0);
__decorate([
    ApiPropertyOptional({ description: 'OnlinePBX integration URL' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "pbxUrl", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Recommended language (rus, uz, en)' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "language", void 0);
__decorate([
    ApiPropertyOptional({ description: 'SIP API URL for call downloading' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sipApiUrl", void 0);
__decorate([
    ApiPropertyOptional({ description: 'SIP API Key for authentication' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sipApiKey", void 0);
__decorate([
    ApiPropertyOptional({ description: 'STT API URL for transcription' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sttApiUrl", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Gemini API Key for LLM analysis' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "geminiApiKey", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Sipuni API URL' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sipuniApiUrl", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Sipuni API Key' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sipuniApiKey", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Sipuni User ID' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "sipuniUserId", void 0);
__decorate([
    ApiPropertyOptional({
        enum: DataSource,
        description: 'Data source selection: PBX or SIPUNI',
    }),
    IsOptional(),
    IsEnum(DataSource),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "dataSource", void 0);
//# sourceMappingURL=update-settings.dto.js.map