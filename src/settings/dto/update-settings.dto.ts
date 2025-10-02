import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum ScoringMode {
  TEN = 'TEN',
  HUNDRED = 'HUNDRED',
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Enable/disable analytics' })
  @IsOptional()
  @IsBoolean()
  analyticsStatus?: boolean;

  @ApiPropertyOptional({
    enum: ScoringMode,
    description: 'Scoring mode: 10 or 100 point scale',
  })
  @IsOptional()
  @IsEnum(ScoringMode)
  scoringMode?: ScoringMode;

  @ApiPropertyOptional({ description: 'Exclude first N seconds from analysis' })
  @IsOptional()
  @IsInt()
  @Min(0)
  excludeSeconds?: number;

  @ApiPropertyOptional({ description: 'OnlinePBX integration URL' })
  @IsOptional()
  @IsString()
  pbxUrl?: string;

  @ApiPropertyOptional({ description: 'Recommended language (rus, uz, en)' })
  @IsOptional()
  @IsString()
  language?: string;
}
