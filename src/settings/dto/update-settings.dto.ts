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

enum DataSource {
  PBX = 'PBX',
  SIPUNI = 'SIPUNI',
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

  @ApiPropertyOptional({ description: 'SIP API URL for call downloading' })
  @IsOptional()
  @IsString()
  sipApiUrl?: string;

  @ApiPropertyOptional({ description: 'SIP API Key for authentication' })
  @IsOptional()
  @IsString()
  sipApiKey?: string;

  @ApiPropertyOptional({ description: 'STT API URL for transcription' })
  @IsOptional()
  @IsString()
  sttApiUrl?: string;

  @ApiPropertyOptional({ description: 'Gemini API Key for LLM analysis' })
  @IsOptional()
  @IsString()
  geminiApiKey?: string;

  @ApiPropertyOptional({ description: 'Sipuni API URL' })
  @IsOptional()
  @IsString()
  sipuniApiUrl?: string;

  @ApiPropertyOptional({ description: 'Sipuni API Key' })
  @IsOptional()
  @IsString()
  sipuniApiKey?: string;

  @ApiPropertyOptional({ description: 'Sipuni User ID' })
  @IsOptional()
  @IsString()
  sipuniUserId?: string;

  @ApiPropertyOptional({
    enum: DataSource,
    description: 'Data source selection: PBX or SIPUNI',
  })
  @IsOptional()
  @IsEnum(DataSource)
  dataSource?: DataSource;
}
