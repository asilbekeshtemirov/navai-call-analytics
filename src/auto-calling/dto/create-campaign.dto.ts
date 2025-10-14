import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Monthly Debt Collection Campaign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Calling all debtors with overdue payments' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CampaignType, example: CampaignType.DEBT_COLLECTION })
  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'Array of contact IDs to include in campaign'
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  contactIds?: string[];
}
