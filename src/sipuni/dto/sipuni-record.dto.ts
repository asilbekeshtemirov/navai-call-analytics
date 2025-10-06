import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SipuniRecordDto {
  @ApiProperty({ description: 'Record ID', example: 'rec_123456' })
  @IsString()
  recordId: string;

  @ApiProperty({ description: 'Call ID', example: 'call_789012' })
  @IsString()
  callId: string;

  @ApiProperty({ description: 'Caller number', required: false })
  @IsOptional()
  @IsString()
  caller?: string;

  @ApiProperty({ description: 'Callee number', required: false })
  @IsOptional()
  @IsString()
  callee?: string;

  @ApiProperty({ description: 'Start time', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: 'Duration in seconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Record URL', required: false })
  @IsOptional()
  @IsString()
  recordUrl?: string;

  @ApiProperty({ description: 'Call status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export interface SipuniCallRecord {
  uid: string;
  client: string;
  caller?: string;
  start?: string;
  start_time?: number;
  record?: string;
  type?: string;
  status?: string;
  diversion?: string;
  destination?: string;
  user?: string;
  user_name?: string;
  wait?: number;
  duration?: number;
}
