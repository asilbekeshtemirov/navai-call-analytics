import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePromitDto {
  @ApiPropertyOptional({
    description: 'Prompt matnli mazmuni',
    example: 'Yangilangan system prompt',
  })
  @IsOptional()
  @IsString({ message: 'Content matn bo\'lishi kerak' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Prompt faol yoki faol emasligi',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive boolean bo\'lishi kerak' })
  isActive?: boolean;
}
