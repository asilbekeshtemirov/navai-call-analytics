import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SipuniExportDto {
  @ApiProperty({ description: 'User ID', example: '064629' })
  @IsString()
  user: string;

  @ApiProperty({ description: 'CRM Links', example: '0', required: false })
  @IsOptional()
  @IsString()
  crmLinks?: string = '0';

  @ApiProperty({ description: 'From date', example: '01.01.2025' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'To date', example: '06.10.2025' })
  @IsString()
  to: string;

  @ApiProperty({ description: 'Type', example: '0', required: false })
  @IsOptional()
  @IsString()
  type?: string = '0';

  @ApiProperty({ description: 'State', example: '0', required: false })
  @IsOptional()
  @IsString()
  state?: string = '0';

  @ApiProperty({ description: 'Time from', example: '10:00', required: false })
  @IsOptional()
  @IsString()
  timeFrom?: string = '10:00';

  @ApiProperty({ description: 'Time to', example: '20:00', required: false })
  @IsOptional()
  @IsString()
  timeTo?: string = '20:00';

  @ApiProperty({ description: 'Tree', example: '', required: false })
  @IsOptional()
  @IsString()
  tree?: string = '';

  @ApiProperty({ description: 'Rating', example: '5', required: false })
  @IsOptional()
  @IsString()
  rating?: string = '5';

  @ApiProperty({ description: 'Show tree ID', example: '1', required: false })
  @IsOptional()
  @IsString()
  showTreeId?: string = '1';

  @ApiProperty({ description: 'From number', example: '', required: false })
  @IsOptional()
  @IsString()
  fromNumber?: string = '';

  @ApiProperty({ description: 'Numbers ringed', example: '0', required: false })
  @IsOptional()
  @IsString()
  numbersRinged?: string = '0';

  @ApiProperty({
    description: 'Numbers involved',
    example: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  numbersInvolved?: string = '0';

  @ApiProperty({ description: 'Names', example: '0', required: false })
  @IsOptional()
  @IsString()
  names?: string = '0';

  @ApiProperty({ description: 'Outgoing line', example: '1', required: false })
  @IsOptional()
  @IsString()
  outgoingLine?: string = '1';

  @ApiProperty({ description: 'To number', example: '', required: false })
  @IsOptional()
  @IsString()
  toNumber?: string = '';

  @ApiProperty({ description: 'To answer', example: '', required: false })
  @IsOptional()
  @IsString()
  toAnswer?: string = '';

  @ApiProperty({ description: 'Anonymous', example: '1', required: false })
  @IsOptional()
  @IsString()
  anonymous?: string = '1';

  @ApiProperty({ description: 'First time', example: '0', required: false })
  @IsOptional()
  @IsString()
  firstTime?: string = '0';

  @ApiProperty({
    description: 'DTMF user answer',
    example: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  dtmfUserAnswer?: string = '0';

  @ApiProperty({
    description: 'Hangup initiator',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  hangupinitor?: string = '1';

  @ApiProperty({
    description: 'Ignore special characters',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ignoreSpecChar?: string = '1';
}
