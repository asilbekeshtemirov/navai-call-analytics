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
import { IsString, IsNotEmpty, IsOptional, MinLength, Matches, } from 'class-validator';
export class CreateOrganizationDto {
    name;
    slug;
    description;
    branchName;
    branchAddress;
    departmentName;
    adminFirstName;
    adminLastName;
    adminPhone;
    adminExtCode;
    adminPassword;
}
__decorate([
    ApiProperty({ example: 'My Company', description: 'Kompaniya nomi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "name", void 0);
__decorate([
    ApiProperty({
        example: 'my-company',
        description: 'URL uchun slug (faqat kichik harflar, raqamlar va tire)',
    }),
    IsString(),
    IsNotEmpty(),
    Matches(/^[a-z0-9-]+$/, {
        message: "Slug faqat kichik harflar, raqamlar va tire (-) dan iborat bo'lishi kerak",
    }),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "slug", void 0);
__decorate([
    ApiProperty({ example: 'My company description', required: false }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ example: 'Main Branch', description: 'Filial nomi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "branchName", void 0);
__decorate([
    ApiProperty({
        example: 'Tashkent, Uzbekistan',
        description: 'Filial manzili',
    }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "branchAddress", void 0);
__decorate([
    ApiProperty({ example: 'Sales Department', description: "Bo'lim nomi" }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "departmentName", void 0);
__decorate([
    ApiProperty({ example: 'John', description: 'Admin ismi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "adminFirstName", void 0);
__decorate([
    ApiProperty({ example: 'Doe', description: 'Admin familiyasi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "adminLastName", void 0);
__decorate([
    ApiProperty({
        example: '+998901234567',
        description: 'Admin telefon raqami',
    }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "adminPhone", void 0);
__decorate([
    ApiProperty({ example: '100', description: 'Admin ichki raqami (ext code)' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "adminExtCode", void 0);
__decorate([
    ApiProperty({
        example: 'admin123',
        description: 'Admin paroli (minimum 6 ta belgi)',
    }),
    IsString(),
    IsNotEmpty(),
    MinLength(6),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "adminPassword", void 0);
//# sourceMappingURL=create-organization.dto.js.map