import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsUUID, IsNotEmpty } from 'class-validator';

export class UploadFromUrlDto {
  @ApiProperty({
    description: 'The URL of the audio file to download.',
    example: 'https://example.com/audio.wav',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'The ID of the employee who made the call.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'The unique identifier for the call from the SIP provider.',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  sipId: string;
}
