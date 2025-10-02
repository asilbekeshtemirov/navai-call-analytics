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
import { IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateCallDto {
    employeeId;
    callerNumber;
    calleeNumber;
    durationSec;
    audioUrl;
}
__decorate([
    ApiProperty({ description: 'ID of the employee associated with the call' }),
    IsString(),
    __metadata("design:type", String)
], CreateCallDto.prototype, "employeeId", void 0);
__decorate([
    ApiProperty({ description: "Caller's phone number" }),
    IsString(),
    __metadata("design:type", String)
], CreateCallDto.prototype, "callerNumber", void 0);
__decorate([
    ApiProperty({ description: "Callee's phone number" }),
    IsString(),
    __metadata("design:type", String)
], CreateCallDto.prototype, "calleeNumber", void 0);
__decorate([
    ApiProperty({ description: 'Duration of the call in seconds' }),
    IsNumber(),
    __metadata("design:type", Number)
], CreateCallDto.prototype, "durationSec", void 0);
__decorate([
    ApiProperty({ description: 'URL of the audio file (optional)', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCallDto.prototype, "audioUrl", void 0);
//# sourceMappingURL=create-call.dto.js.map