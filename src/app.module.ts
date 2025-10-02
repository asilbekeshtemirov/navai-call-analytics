import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CallModule } from './call/call.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { BranchModule } from './branch/branch.module.js';
import { DepartmentModule } from './department/department.module.js';
import { CriteriaModule } from './criteria/criteria.module.js';
import { TopicModule } from './topic/topic.module.js';
import { PromptModule } from './prompt/prompt.module.js';
import { ReportModule } from './report/report.module.js';
import { SipModule } from './sip/sip.module.js';
import { AiModule } from './ai/ai.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CallModule,
    AuthModule,
    UserModule,
    BranchModule,
    DepartmentModule,
    CriteriaModule,
    TopicModule,
    PromptModule,
    ReportModule,
    SipModule,
    AiModule,
    SettingsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
