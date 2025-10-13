import { ApiProperty } from '@nestjs/swagger';

export class SessionStatusDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'session-1738862891234-abc123' })
  sessionId: string;

  @ApiProperty({
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
    example: 'COMPLETED',
  })
  status: string;

  @ApiProperty({ example: 150, description: 'Jami raqamlar soni' })
  totalNumbers: number;

  @ApiProperty({ example: 150, description: 'Qayta ishlangan raqamlar soni' })
  processedNumbers: number;

  @ApiProperty({ example: 120, description: "Muvaffaqiyatli qo'ng'iroqlar" })
  connectedCalls: number;

  @ApiProperty({ example: 30, description: "Muvaffaqiyatsiz qo'ng'iroqlar" })
  failedCalls: number;

  @ApiProperty({
    example: 'Call process completed successfully',
    nullable: true,
    description: 'Remote serverdan qaytgan javob',
  })
  remoteResponse: string | null;

  @ApiProperty({
    example: null,
    nullable: true,
    description: "Xato xabari (agar bo'lsa)",
  })
  errorMessage: string | null;

  @ApiProperty({ example: '2025-10-06T18:30:00.000Z' })
  startedAt: Date;

  @ApiProperty({
    example: '2025-10-06T18:32:15.000Z',
    nullable: true,
    description: "Tugagan vaqti (agar tugagan bo'lsa)",
  })
  completedAt: Date | null;

  @ApiProperty({
    example: 135,
    description: 'Davomiyligi (sekundlarda)',
    nullable: true,
  })
  durationSeconds?: number;

  @ApiProperty({
    example: 80,
    description: 'Jarayonning foizi (%)',
  })
  progressPercentage?: number;

  @ApiProperty({
    example: 'Qayta ishlanmoqda...',
    description: 'Status tavsifi',
  })
  statusDescription?: string;

  @ApiProperty({ example: '2025-10-06T18:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-06T18:32:15.000Z' })
  updatedAt: Date;
}
