var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SipuniService } from './sipuni.service.js';
import { SipuniController, SipuniWebhookController, } from './sipuni.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AiModule } from '../ai/ai.module.js';
let SipuniModule = class SipuniModule {
};
SipuniModule = __decorate([
    Module({
        imports: [HttpModule, PrismaModule, forwardRef(() => AiModule)],
        controllers: [SipuniController, SipuniWebhookController],
        providers: [SipuniService],
        exports: [SipuniService],
    })
], SipuniModule);
export { SipuniModule };
//# sourceMappingURL=sipuni.module.js.map