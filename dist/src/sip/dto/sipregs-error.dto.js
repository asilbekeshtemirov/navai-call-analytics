var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsObject, IsIn } from 'class-validator';
export class SipregsErrorDto {
    cmd;
    type;
    crm_token;
    id;
    data;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    IsIn(['webhook']),
    __metadata("design:type", String)
], SipregsErrorDto.prototype, "cmd", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    IsIn(['sipregs_error']),
    __metadata("design:type", String)
], SipregsErrorDto.prototype, "type", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SipregsErrorDto.prototype, "crm_token", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SipregsErrorDto.prototype, "id", void 0);
__decorate([
    IsObject(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], SipregsErrorDto.prototype, "data", void 0);
//# sourceMappingURL=sipregs-error.dto.js.map