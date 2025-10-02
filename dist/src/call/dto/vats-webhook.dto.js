var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
export class HistoryDto {
    cmd;
    type;
    status;
    phone;
    user;
    start;
    duration;
    link;
    crm_token;
    callid;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "cmd", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "type", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "status", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "phone", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "user", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "start", void 0);
__decorate([
    IsNumber(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], HistoryDto.prototype, "duration", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "link", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "crm_token", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], HistoryDto.prototype, "callid", void 0);
export class EventDto {
    cmd;
    crm_token;
    type;
    callid;
    phone;
    user;
    direction;
    diversion;
    groupRealName;
    ext;
    telnum;
    telnum_name;
    second_callid;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EventDto.prototype, "cmd", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EventDto.prototype, "crm_token", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    IsIn(['INCOMING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'OUTGOING', 'TRANSFERRED']),
    __metadata("design:type", String)
], EventDto.prototype, "type", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EventDto.prototype, "callid", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EventDto.prototype, "phone", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EventDto.prototype, "user", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    IsIn(['in', 'out']),
    __metadata("design:type", String)
], EventDto.prototype, "direction", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "diversion", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "groupRealName", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "ext", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "telnum", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "telnum_name", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EventDto.prototype, "second_callid", void 0);
export class ContactDto {
    cmd;
    crm_token;
    phone;
    callid;
    diversion;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ContactDto.prototype, "cmd", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ContactDto.prototype, "crm_token", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ContactDto.prototype, "phone", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ContactDto.prototype, "callid", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], ContactDto.prototype, "diversion", void 0);
export class RatingDto {
    cmd;
    crm_token;
    phone;
    callid;
    rating;
    user;
    ext;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RatingDto.prototype, "cmd", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RatingDto.prototype, "crm_token", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RatingDto.prototype, "phone", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RatingDto.prototype, "callid", void 0);
__decorate([
    IsNumber(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], RatingDto.prototype, "rating", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RatingDto.prototype, "user", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], RatingDto.prototype, "ext", void 0);
//# sourceMappingURL=vats-webhook.dto.js.map