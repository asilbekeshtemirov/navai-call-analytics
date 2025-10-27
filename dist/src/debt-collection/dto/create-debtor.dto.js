var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNumber, IsOptional, IsEmail, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateDebtorDto {
    firstName;
    lastName;
    phone;
    alternatePhone;
    email;
    debtAmount;
    currency;
    contractNumber;
    dueDate;
    productService;
    debtReason;
}
__decorate([
    ApiProperty({ example: 'Sardor' }),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "firstName", void 0);
__decorate([
    ApiProperty({ example: 'Karimov' }),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "lastName", void 0);
__decorate([
    ApiProperty({ example: '998901234567' }),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: '998907654321' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "alternatePhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'sardor@example.com' }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 5000000, description: 'Debt amount' }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateDebtorDto.prototype, "debtAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 'UZS', default: 'UZS' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: 'LOAN-2024-001' }),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "contractNumber", void 0);
__decorate([
    ApiProperty({ example: '2024-10-01', description: 'Due date in ISO format' }),
    IsDateString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "dueDate", void 0);
__decorate([
    ApiProperty({ example: 'Kreditga olingan telefon' }),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "productService", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateDebtorDto.prototype, "debtReason", void 0);
//# sourceMappingURL=create-debtor.dto.js.map