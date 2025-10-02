import { Module } from '@nestjs/common';
import { SipService } from './sip.service.js';
import { SipController } from './sip.controller.js';

@Module({
  controllers: [SipController],
  providers: [SipService],
})
export class SipModule {}
