var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SipService_1;
import { Injectable, Logger } from '@nestjs/common';
let SipService = SipService_1 = class SipService {
    logger = new Logger(SipService_1.name);
    handleSipregsError(sipregsErrorDto) {
        this.logger.log('Received sipregs_error webhook:');
        this.logger.log(JSON.stringify(sipregsErrorDto, null, 2));
    }
};
SipService = SipService_1 = __decorate([
    Injectable()
], SipService);
export { SipService };
//# sourceMappingURL=sip.service.js.map