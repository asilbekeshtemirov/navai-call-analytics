import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StatisticsModule } from '../statistics/statistics.module.js';
import { SipuniModule } from '../sipuni/sipuni.module.js';

@Module({
  imports: [PrismaModule, StatisticsModule, SipuniModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
