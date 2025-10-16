import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutoCallingController } from './auto-calling.controller.js';
import { AutoCallingService } from './auto-calling.service.js';
import { AutoCallingGateway } from './auto-calling.gateway.js';
import { TwilioService } from './twilio.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AutoCallingController],
  providers: [AutoCallingService, AutoCallingGateway, TwilioService],
  exports: [AutoCallingService, AutoCallingGateway, TwilioService],
})
export class AutoCallingModule {}
