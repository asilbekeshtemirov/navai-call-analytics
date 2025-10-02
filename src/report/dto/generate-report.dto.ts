import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateFrom: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateTo: string;
}
