import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Kuzgi qarz yig\'ish kampaniyasi' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Oktabr oyidagi qarzdorlar uchun' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 9, default: 9, minimum: 0, maximum: 23 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  dailyCallStartHour?: number;

  @ApiPropertyOptional({ example: 18, default: 18, minimum: 0, maximum: 23 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  dailyCallEndHour?: number;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCallsPerDay?: number;

  @ApiProperty({
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'Array of debtor IDs to include in campaign'
  })
  @IsArray()
  debtorIds: string[];
}
