import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePromitDto {
  @ApiPropertyOptional({
    description: 'Promit matnli mazmuni',
    example: 'Yangilangan promit matni',
  })
  @IsOptional()
  @IsString({ message: 'Content matn bo\'lishi kerak' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Promit faol yoki faol emasligi',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive boolean bo\'lishi kerak' })
  isActive?: boolean;
}
