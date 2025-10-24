import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePromitDto {
  @ApiProperty({
    description: 'Prompt matnli mazmuni',
    example: 'Bu yerda system prompt yoziladi',
  })
  @IsNotEmpty({ message: 'Content kiritilishi shart' })
  @IsString({ message: 'Content matn bo\'lishi kerak' })
  content: string;
}
