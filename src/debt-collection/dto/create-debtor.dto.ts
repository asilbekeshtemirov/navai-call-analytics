import { IsString, IsNumber, IsOptional, IsEmail, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDebtorDto {
  @ApiProperty({ example: 'Sardor' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Karimov' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '998901234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '998907654321' })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiPropertyOptional({ example: 'sardor@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 5000000, description: 'Debt amount' })
  @IsNumber()
  @Min(0)
  debtAmount: number;

  @ApiPropertyOptional({ example: 'UZS', default: 'UZS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'LOAN-2024-001' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ example: '2024-10-01', description: 'Due date in ISO format' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 'Kreditga olingan telefon' })
  @IsString()
  productService: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  debtReason?: string;
}
