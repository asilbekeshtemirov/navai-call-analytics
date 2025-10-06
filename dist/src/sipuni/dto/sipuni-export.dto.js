var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SipuniExportDto {
    user;
    crmLinks = '0';
    from;
    to;
    type = '0';
    state = '0';
    timeFrom = '10:00';
    timeTo = '20:00';
    tree = '';
    rating = '5';
    showTreeId = '1';
    fromNumber = '';
    numbersRinged = '0';
    numbersInvolved = '0';
    names = '0';
    outgoingLine = '1';
    toNumber = '';
    toAnswer = '';
    anonymous = '1';
    firstTime = '0';
    dtmfUserAnswer = '0';
    hangupinitor = '1';
    ignoreSpecChar = '1';
}
__decorate([
    ApiProperty({ description: 'User ID', example: '064629' }),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "user", void 0);
__decorate([
    ApiProperty({ description: 'CRM Links', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "crmLinks", void 0);
__decorate([
    ApiProperty({ description: 'From date', example: '01.01.2025' }),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "from", void 0);
__decorate([
    ApiProperty({ description: 'To date', example: '06.10.2025' }),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "to", void 0);
__decorate([
    ApiProperty({ description: 'Type', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "type", void 0);
__decorate([
    ApiProperty({ description: 'State', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "state", void 0);
__decorate([
    ApiProperty({ description: 'Time from', example: '10:00', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "timeFrom", void 0);
__decorate([
    ApiProperty({ description: 'Time to', example: '20:00', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "timeTo", void 0);
__decorate([
    ApiProperty({ description: 'Tree', example: '', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "tree", void 0);
__decorate([
    ApiProperty({ description: 'Rating', example: '5', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "rating", void 0);
__decorate([
    ApiProperty({ description: 'Show tree ID', example: '1', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "showTreeId", void 0);
__decorate([
    ApiProperty({ description: 'From number', example: '', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "fromNumber", void 0);
__decorate([
    ApiProperty({ description: 'Numbers ringed', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "numbersRinged", void 0);
__decorate([
    ApiProperty({
        description: 'Numbers involved',
        example: '0',
        required: false,
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "numbersInvolved", void 0);
__decorate([
    ApiProperty({ description: 'Names', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "names", void 0);
__decorate([
    ApiProperty({ description: 'Outgoing line', example: '1', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "outgoingLine", void 0);
__decorate([
    ApiProperty({ description: 'To number', example: '', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "toNumber", void 0);
__decorate([
    ApiProperty({ description: 'To answer', example: '', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "toAnswer", void 0);
__decorate([
    ApiProperty({ description: 'Anonymous', example: '1', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "anonymous", void 0);
__decorate([
    ApiProperty({ description: 'First time', example: '0', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "firstTime", void 0);
__decorate([
    ApiProperty({
        description: 'DTMF user answer',
        example: '0',
        required: false,
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "dtmfUserAnswer", void 0);
__decorate([
    ApiProperty({
        description: 'Hangup initiator',
        example: '1',
        required: false,
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "hangupinitor", void 0);
__decorate([
    ApiProperty({
        description: 'Ignore special characters',
        example: '1',
        required: false,
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniExportDto.prototype, "ignoreSpecChar", void 0);
//# sourceMappingURL=sipuni-export.dto.js.map