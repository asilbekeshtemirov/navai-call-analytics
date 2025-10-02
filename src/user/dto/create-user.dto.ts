import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
