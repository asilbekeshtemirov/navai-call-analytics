import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '@prisma/client';

export class UploadExcelDto {
  @ApiPropertyOptional({
    enum: CampaignType,
    example: CampaignType.DEBT_COLLECTION,
    description: 'Campaign type for the uploaded contacts'
  })
  @IsOptional()
  @IsEnum(CampaignType)
  campaignType?: CampaignType;
}
