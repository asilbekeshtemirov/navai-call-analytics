import { Module } from '@nestjs/common';
import { CriteriaService } from './criteria.service.js';
import { CriteriaController } from './criteria.controller.js';

@Module({
  controllers: [CriteriaController],
  providers: [CriteriaService],
})
export class CriteriaModule {}
