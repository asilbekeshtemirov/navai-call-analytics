import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePromitDto {
  @ApiProperty({
    description: 'Promit matnli mazmuni',
    example: 'Bu yerda promit matni yoziladi',
  })
  @IsNotEmpty({ message: 'Content kiritilishi shart' })
  @IsString({ message: 'Content matn bo\'lishi kerak' })
  content: string;
}
