import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCallDto {
  @ApiProperty({ description: 'ID of the employee associated with the call' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: "Caller's phone number" })
  @IsString()
  callerNumber: string;

  @ApiProperty({ description: "Callee's phone number" })
  @IsString()
  calleeNumber: string;

  @ApiProperty({ description: 'Duration of the call in seconds' })
  @IsNumber()
  durationSec: number;

  @ApiProperty({ description: 'URL of the audio file (optional)', required: false })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}