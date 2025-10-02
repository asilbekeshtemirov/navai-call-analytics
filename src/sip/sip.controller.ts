import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SipService } from './sip.service.js';
import { SipregsErrorDto } from './dto/sipregs-error.dto.js';

@Controller('sip')
export class SipController {
  constructor(private readonly sipService: SipService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  handleSipregsError(@Body() sipregsErrorDto: SipregsErrorDto) {
    return this.sipService.handleSipregsError(sipregsErrorDto);
  }
}
