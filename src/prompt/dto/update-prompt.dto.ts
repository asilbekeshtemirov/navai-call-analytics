import { PartialType } from '@nestjs/swagger';
import { CreatePromptDto } from './create-prompt.dto.js';

export class UpdatePromptDto extends PartialType(CreatePromptDto) {}
