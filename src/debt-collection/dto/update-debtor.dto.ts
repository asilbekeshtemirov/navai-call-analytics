import { PartialType } from '@nestjs/swagger';
import { CreateDebtorDto } from './create-debtor.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum DebtorStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  DISPUTED = 'DISPUTED',
  DO_NOT_CALL = 'DO_NOT_CALL',
  LEGAL_ACTION = 'LEGAL_ACTION',
}

export class UpdateDebtorDto extends PartialType(CreateDebtorDto) {
  @ApiPropertyOptional({ enum: DebtorStatus })
  @IsOptional()
  @IsEnum(DebtorStatus)
  status?: DebtorStatus;
}
