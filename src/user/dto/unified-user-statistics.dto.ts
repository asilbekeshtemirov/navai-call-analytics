import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatisticsType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  SUMMARY = 'summary',
  ALL = 'all',
}

export class UnifiedUserStatisticsDto {
  @ApiPropertyOptional({
    description: 'Type of statistics to retrieve',
    enum: UserStatisticsType,
    default: UserStatisticsType.ALL,
  })
  @IsOptional()
  @IsEnum(UserStatisticsType)
  type?: UserStatisticsType = UserStatisticsType.ALL;

  @ApiPropertyOptional({
    description:
      'Ixtiyoriy: Boshlanish sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description:
      'Ixtiyoriy: Tugash sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
