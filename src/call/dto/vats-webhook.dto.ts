import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export class HistoryDto {
  @IsString()
  @IsNotEmpty()
  cmd: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  start: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsNotEmpty()
  crm_token: string;

  @IsString()
  @IsNotEmpty()
  callid: string;
}

export class EventDto {
  @IsString()
  @IsNotEmpty()
  cmd: string;

  @IsString()
  @IsNotEmpty()
  crm_token: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['INCOMING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'OUTGOING', 'TRANSFERRED'])
  type: string;

  @IsString()
  @IsNotEmpty()
  callid: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['in', 'out'])
  direction: string;

  @IsString()
  @IsOptional()
  diversion?: string;

  @IsString()
  @IsOptional()
  groupRealName?: string;

  @IsString()
  @IsOptional()
  ext?: string;

  @IsString()
  @IsOptional()
  telnum?: string;

  @IsString()
  @IsOptional()
  telnum_name?: string;

  @IsString()
  @IsOptional()
  second_callid?: string;
}

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  cmd: string;

  @IsString()
  @IsNotEmpty()
  crm_token: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  callid: string;

  @IsString()
  @IsOptional()
  diversion?: string;
}

export class RatingDto {
  @IsString()
  @IsNotEmpty()
  cmd: string;

  @IsString()
  @IsNotEmpty()
  crm_token: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  callid: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsOptional()
  ext?: string;
}
