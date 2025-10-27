var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PartialType } from '@nestjs/swagger';
import { CreateDebtorDto } from './create-debtor.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
var DebtorStatus;
(function (DebtorStatus) {
    DebtorStatus["ACTIVE"] = "ACTIVE";
    DebtorStatus["PAID"] = "PAID";
    DebtorStatus["DISPUTED"] = "DISPUTED";
    DebtorStatus["DO_NOT_CALL"] = "DO_NOT_CALL";
    DebtorStatus["LEGAL_ACTION"] = "LEGAL_ACTION";
})(DebtorStatus || (DebtorStatus = {}));
export class UpdateDebtorDto extends PartialType(CreateDebtorDto) {
    status;
}
__decorate([
    ApiPropertyOptional({ enum: DebtorStatus }),
    IsOptional(),
    IsEnum(DebtorStatus),
    __metadata("design:type", String)
], UpdateDebtorDto.prototype, "status", void 0);
//# sourceMappingURL=update-debtor.dto.js.map