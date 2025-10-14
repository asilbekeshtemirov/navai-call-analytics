var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateContactDto {
    firstName;
    lastName;
    phone;
    dateOfBirth;
    customData;
    notes;
}
__decorate([
    ApiProperty({ example: 'John' }),
    IsString(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "firstName", void 0);
__decorate([
    ApiProperty({ example: 'Doe' }),
    IsString(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "lastName", void 0);
__decorate([
    ApiProperty({ example: '+998901234567' }),
    IsString(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: '1990-01-15' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "dateOfBirth", void 0);
__decorate([
    ApiPropertyOptional({
        example: {
            totalDebt: 5000,
            remainingDebt: 3000,
            lastPaymentAmount: 2000,
        },
    }),
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], CreateContactDto.prototype, "customData", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Customer requested callback' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "notes", void 0);
//# sourceMappingURL=create-contact.dto.js.map