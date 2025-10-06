import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum StatisticsType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  SUMMARY = 'summary',
  ALL = 'all',
}

export class UnifiedStatisticsDto {
  @ApiPropertyOptional({
    description: 'Type of statistics to retrieve',
    enum: StatisticsType,
    default: StatisticsType.ALL,
  })
  @IsOptional()
  @IsEnum(StatisticsType)
  type?: StatisticsType = StatisticsType.ALL;

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

  @ApiPropertyOptional({
    description: "Ixtiyoriy: Extension code bo'yicha filter",
  })
  @IsOptional()
  @IsString()
  extCode?: string;
}
