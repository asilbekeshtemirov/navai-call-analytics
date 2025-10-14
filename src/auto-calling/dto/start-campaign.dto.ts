import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartCampaignDto {
  @ApiProperty({ example: 'campaign-uuid-here' })
  @IsUUID('4')
  campaignId: string;
}
