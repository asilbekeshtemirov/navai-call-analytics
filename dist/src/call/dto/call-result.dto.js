var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, IsDateString, IsUrl } from 'class-validator';
export var CallResultStatus;
(function (CallResultStatus) {
    CallResultStatus["ANSWERED"] = "ANSWERED";
    CallResultStatus["NO_ANSWER"] = "NO_ANSWER";
    CallResultStatus["BUSY"] = "BUSY";
    CallResultStatus["FAILED"] = "FAILED";
    CallResultStatus["CONNECTED_TO_OPERATOR"] = "CONNECTED_TO_OPERATOR";
    CallResultStatus["REJECTED"] = "REJECTED";
    CallResultStatus["INVALID_NUMBER"] = "INVALID_NUMBER";
    CallResultStatus["NETWORK_ERROR"] = "NETWORK_ERROR";
})(CallResultStatus || (CallResultStatus = {}));
export class CallResultDto {
    sessionId;
    phoneNumber;
    callStatus;
    callDuration;
    operatorName;
    operatorId;
    callStartTime;
    callEndTime;
    recordingUrl;
    notes;
}
__decorate([
    ApiProperty({ example: 'session-1738862891234-abc123' }),
    IsString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "sessionId", void 0);
__decorate([
    ApiProperty({ example: '+998901234567' }),
    IsString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "phoneNumber", void 0);
__decorate([
    ApiProperty({
        enum: CallResultStatus,
        example: CallResultStatus.ANSWERED,
        description: `
      ANSWERED - Telefon ko'tarildi
      NO_ANSWER - Javob berilmadi
      BUSY - Band
      FAILED - O'chirilgan/mavjud emas
      CONNECTED_TO_OPERATOR - Operator bilan bog'landi
      REJECTED - Rad etildi
      INVALID_NUMBER - Noto'g'ri raqam
      NETWORK_ERROR - Tarmoq xatosi
    `
    }),
    IsEnum(CallResultStatus),
    __metadata("design:type", String)
], CallResultDto.prototype, "callStatus", void 0);
__decorate([
    ApiProperty({ example: 45, required: false, description: 'Qo\'ng\'iroq davomiyligi (sekundlarda)' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CallResultDto.prototype, "callDuration", void 0);
__decorate([
    ApiProperty({ example: 'Alisher Valijonov', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "operatorName", void 0);
__decorate([
    ApiProperty({ example: 'uuid', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "operatorId", void 0);
__decorate([
    ApiProperty({ example: '2025-10-06T18:30:00.000Z', required: false }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "callStartTime", void 0);
__decorate([
    ApiProperty({ example: '2025-10-06T18:30:45.000Z', required: false }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "callEndTime", void 0);
__decorate([
    ApiProperty({ example: 'https://recordings.example.com/call-12345.mp3', required: false }),
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], CallResultDto.prototype, "recordingUrl", void 0);
__decorate([
    ApiProperty({ example: 'Mijoz mahsulot haqida so\'radi', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CallResultDto.prototype, "notes", void 0);
export class CallResultResponseDto {
    id;
    sessionId;
    phoneNumber;
    callStatus;
    callDuration;
    operatorName;
    operatorId;
    callStartTime;
    callEndTime;
    recordingUrl;
    notes;
    createdAt;
    updatedAt;
    statusDescription;
}
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CallResultResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CallResultResponseDto.prototype, "sessionId", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CallResultResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    ApiProperty({ enum: CallResultStatus }),
    __metadata("design:type", String)
], CallResultResponseDto.prototype, "callStatus", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "callDuration", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "operatorName", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "operatorId", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "callStartTime", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "callEndTime", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "recordingUrl", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Object)
], CallResultResponseDto.prototype, "notes", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Date)
], CallResultResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Date)
], CallResultResponseDto.prototype, "updatedAt", void 0);
__decorate([
    ApiProperty({ description: 'Status tavsifi o\'zbekcha' }),
    __metadata("design:type", String)
], CallResultResponseDto.prototype, "statusDescription", void 0);
//# sourceMappingURL=call-result.dto.js.map