import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CallModule } from './call/call.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { DepartmentModule } from './department/department.module.js';
import { CriteriaModule } from './criteria/criteria.module.js';

import { AiModule } from './ai/ai.module.js';

import { StatisticsModule } from './statistics/statistics.module.js';
import { PbxModule } from './pbx/pbx.module.js';
import { CompanyModule } from './company/company.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { BranchModule } from './branch/branch.module.js';
import { SipuniModule } from './sipuni/sipuni.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { OrganizationModule } from './organization/organization.module.js';
import { AutoCallingModule } from './auto-calling/auto-calling.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CallModule,
    AuthModule,
    UserModule,
    DepartmentModule,
    CriteriaModule,
    AiModule,

    StatisticsModule,
    PbxModule,
    CompanyModule,
    SettingsModule,
    BranchModule,
    SipuniModule,
    OrganizationModule,
    AutoCallingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
