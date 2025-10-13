import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'My Company', description: 'Kompaniya nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'my-company',
    description: 'URL uchun slug (faqat kichik harflar, raqamlar va tire)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Slug faqat kichik harflar, raqamlar va tire (-) dan iborat bo'lishi kerak",
  })
  slug: string;

  @ApiProperty({ example: 'My company description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Main Branch', description: 'Filial nomi' })
  @IsString()
  @IsNotEmpty()
  branchName: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    description: 'Filial manzili',
  })
  @IsString()
  @IsNotEmpty()
  branchAddress: string;

  @ApiProperty({ example: 'Sales Department', description: "Bo'lim nomi" })
  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @ApiProperty({ example: 'John', description: 'Admin ismi' })
  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @ApiProperty({ example: 'Doe', description: 'Admin familiyasi' })
  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Admin telefon raqami',
  })
  @IsString()
  @IsNotEmpty()
  adminPhone: string;

  @ApiProperty({ example: '100', description: 'Admin ichki raqami (ext code)' })
  @IsString()
  @IsNotEmpty()
  adminExtCode: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Admin paroli (minimum 6 ta belgi)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;
}
