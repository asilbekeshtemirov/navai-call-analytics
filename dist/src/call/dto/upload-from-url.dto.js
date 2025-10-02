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
import { IsString, IsUrl, IsUUID, IsNotEmpty } from 'class-validator';
export class UploadFromUrlDto {
    url;
    employeeId;
    sipId;
}
__decorate([
    ApiProperty({
        description: 'The URL of the audio file to download.',
        example: 'https://example.com/audio.wav',
    }),
    IsUrl(),
    __metadata("design:type", String)
], UploadFromUrlDto.prototype, "url", void 0);
__decorate([
    ApiProperty({
        description: 'The ID of the employee who made the call.',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    }),
    IsString(),
    IsUUID(),
    __metadata("design:type", String)
], UploadFromUrlDto.prototype, "employeeId", void 0);
__decorate([
    ApiProperty({
        description: 'The unique identifier for the call from the SIP provider.',
        example: '1234567890',
    }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], UploadFromUrlDto.prototype, "sipId", void 0);
//# sourceMappingURL=upload-from-url.dto.js.map