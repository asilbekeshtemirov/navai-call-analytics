var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StatisticsModule } from '../statistics/statistics.module.js';
let CompanyModule = class CompanyModule {
};
CompanyModule = __decorate([
    Module({
        imports: [PrismaModule, StatisticsModule],
        controllers: [CompanyController],
        providers: [CompanyService],
        exports: [CompanyService],
    })
], CompanyModule);
export { CompanyModule };
//# sourceMappingURL=company.module.js.map