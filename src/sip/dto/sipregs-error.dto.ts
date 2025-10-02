import { IsString, IsNotEmpty, IsObject, IsIn } from 'class-validator';

export class SipregsErrorDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['webhook'])
  cmd: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['sipregs_error'])
  type: string;

  @IsString()
  @IsNotEmpty()
  crm_token: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsObject()
  @IsNotEmpty()
  data: object;
}
