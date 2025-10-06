var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SipuniRecordDto {
    recordId;
    callId;
    caller;
    callee;
    startTime;
    duration;
    recordUrl;
    status;
}
__decorate([
    ApiProperty({ description: 'Record ID', example: 'rec_123456' }),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "recordId", void 0);
__decorate([
    ApiProperty({ description: 'Call ID', example: 'call_789012' }),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "callId", void 0);
__decorate([
    ApiProperty({ description: 'Caller number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "caller", void 0);
__decorate([
    ApiProperty({ description: 'Callee number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "callee", void 0);
__decorate([
    ApiProperty({ description: 'Start time', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "startTime", void 0);
__decorate([
    ApiProperty({ description: 'Duration in seconds', required: false }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], SipuniRecordDto.prototype, "duration", void 0);
__decorate([
    ApiProperty({ description: 'Record URL', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "recordUrl", void 0);
__decorate([
    ApiProperty({ description: 'Call status', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SipuniRecordDto.prototype, "status", void 0);
//# sourceMappingURL=sipuni-record.dto.js.map