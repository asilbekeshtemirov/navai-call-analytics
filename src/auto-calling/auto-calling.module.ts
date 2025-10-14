import { Module } from '@nestjs/common';
import { AutoCallingController } from './auto-calling.controller.js';
import { AutoCallingService } from './auto-calling.service.js';
import { AutoCallingGateway } from './auto-calling.gateway.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AutoCallingController],
  providers: [AutoCallingService, AutoCallingGateway],
  exports: [AutoCallingService, AutoCallingGateway],
})
export class AutoCallingModule {}
