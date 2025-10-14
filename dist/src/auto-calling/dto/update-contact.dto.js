var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto.js';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateContactDto extends PartialType(CreateContactDto) {
    status;
    lastConversationOutcome;
    currentConversationOutcome;
}
__decorate([
    ApiPropertyOptional({ enum: ContactStatus }),
    IsOptional(),
    IsEnum(ContactStatus),
    __metadata("design:type", String)
], UpdateContactDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateContactDto.prototype, "lastConversationOutcome", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateContactDto.prototype, "currentConversationOutcome", void 0);
//# sourceMappingURL=update-contact.dto.js.map