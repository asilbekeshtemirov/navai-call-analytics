import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SipService } from './sip.service.js';
import { SipregsErrorDto } from './dto/sipregs-error.dto.js';
import { Public } from '../auth/public.decorator.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sip')
@Controller('sip')
export class SipController {
  constructor(private readonly sipService: SipService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  handleSipregsError(@Body() sipregsErrorDto: SipregsErrorDto) {
    return this.sipService.handleSipregsError(sipregsErrorDto);
  }
}
