import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ description: 'Filialni nomini kiriting' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Menejer ID (optional)' })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ required: false, description: 'Filial manzili (optional)' })
  @IsString()
  @IsOptional()
  address?: string;
}
