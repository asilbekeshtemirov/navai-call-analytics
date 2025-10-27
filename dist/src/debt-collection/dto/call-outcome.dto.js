var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEnum, IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
var DebtCallOutcome;
(function (DebtCallOutcome) {
    DebtCallOutcome["PROMISE"] = "PROMISE";
    DebtCallOutcome["DISPUTED"] = "DISPUTED";
    DebtCallOutcome["REFUSED"] = "REFUSED";
    DebtCallOutcome["NO_ANSWER"] = "NO_ANSWER";
    DebtCallOutcome["WRONG_NUMBER"] = "WRONG_NUMBER";
    DebtCallOutcome["CALLBACK_REQUESTED"] = "CALLBACK_REQUESTED";
    DebtCallOutcome["PAID"] = "PAID";
})(DebtCallOutcome || (DebtCallOutcome = {}));
export class RecordOutcomeDto {
    outcome;
    promisedAmount;
    promisedDate;
    notes;
}
__decorate([
    ApiProperty({ enum: DebtCallOutcome }),
    IsEnum(DebtCallOutcome),
    __metadata("design:type", String)
], RecordOutcomeDto.prototype, "outcome", void 0);
__decorate([
    ApiPropertyOptional({ example: 1000000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], RecordOutcomeDto.prototype, "promisedAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: '2024-11-15' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], RecordOutcomeDto.prototype, "promisedDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RecordOutcomeDto.prototype, "notes", void 0);
//# sourceMappingURL=call-outcome.dto.js.map