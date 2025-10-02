import { Module } from '@nestjs/common';
import { PbxController } from './pbx.controller.js';
import { PbxService } from './pbx.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [PbxController],
  providers: [PbxService],
  exports: [PbxService],
})
export class PbxModule {}
