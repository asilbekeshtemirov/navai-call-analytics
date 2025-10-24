import { Module } from '@nestjs/common';
import { PromitService } from './promit.service.js';
import { PromitController } from './promit.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PromitController],
  providers: [PromitService],
  exports: [PromitService],
})
export class PromitModule {}
