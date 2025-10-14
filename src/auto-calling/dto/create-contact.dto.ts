import { IsString, IsOptional, IsObject, IsDateString, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: {
      totalDebt: 5000,
      remainingDebt: 3000,
      lastPaymentAmount: 2000,
    },
  })
  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Customer requested callback' })
  @IsOptional()
  @IsString()
  notes?: string;
}
