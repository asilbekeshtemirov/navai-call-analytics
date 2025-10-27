import { IsEnum, IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum DebtCallOutcome {
  PROMISE = 'PROMISE',
  DISPUTED = 'DISPUTED',
  REFUSED = 'REFUSED',
  NO_ANSWER = 'NO_ANSWER',
  WRONG_NUMBER = 'WRONG_NUMBER',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  PAID = 'PAID',
}

export class RecordOutcomeDto {
  @ApiProperty({ enum: DebtCallOutcome })
  @IsEnum(DebtCallOutcome)
  outcome: DebtCallOutcome;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @IsNumber()
  promisedAmount?: number;

  @ApiPropertyOptional({ example: '2024-11-15' })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
