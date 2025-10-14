import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto.js';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastConversationOutcome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentConversationOutcome?: string;
}
