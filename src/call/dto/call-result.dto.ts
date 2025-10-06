import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, IsDateString, IsUrl } from 'class-validator';

export enum CallResultStatus {
  ANSWERED = 'ANSWERED',
  NO_ANSWER = 'NO_ANSWER',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  CONNECTED_TO_OPERATOR = 'CONNECTED_TO_OPERATOR',
  REJECTED = 'REJECTED',
  INVALID_NUMBER = 'INVALID_NUMBER',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class CallResultDto {
  @ApiProperty({ example: 'session-1738862891234-abc123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    enum: CallResultStatus,
    example: CallResultStatus.ANSWERED,
    description: `
      ANSWERED - Telefon ko'tarildi
      NO_ANSWER - Javob berilmadi
      BUSY - Band
      FAILED - O'chirilgan/mavjud emas
      CONNECTED_TO_OPERATOR - Operator bilan bog'landi
      REJECTED - Rad etildi
      INVALID_NUMBER - Noto'g'ri raqam
      NETWORK_ERROR - Tarmoq xatosi
    `
  })
  @IsEnum(CallResultStatus)
  callStatus: CallResultStatus;

  @ApiProperty({ example: 45, required: false, description: 'Qo\'ng\'iroq davomiyligi (sekundlarda)' })
  @IsOptional()
  @IsInt()
  callDuration?: number;

  @ApiProperty({ example: 'Alisher Valijonov', required: false })
  @IsOptional()
  @IsString()
  operatorName?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiProperty({ example: '2025-10-06T18:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  callStartTime?: string;

  @ApiProperty({ example: '2025-10-06T18:30:45.000Z', required: false })
  @IsOptional()
  @IsDateString()
  callEndTime?: string;

  @ApiProperty({ example: 'https://recordings.example.com/call-12345.mp3', required: false })
  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @ApiProperty({ example: 'Mijoz mahsulot haqida so\'radi', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CallResultResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: CallResultStatus })
  callStatus: CallResultStatus;

  @ApiProperty()
  callDuration: number | null;

  @ApiProperty()
  operatorName: string | null;

  @ApiProperty()
  operatorId: string | null;

  @ApiProperty()
  callStartTime: Date | null;

  @ApiProperty()
  callEndTime: Date | null;

  @ApiProperty()
  recordingUrl: string | null;

  @ApiProperty()
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Status tavsifi o\'zbekcha' })
  statusDescription?: string;
}
