var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
export class SessionStatusDto {
    id;
    sessionId;
    status;
    totalNumbers;
    processedNumbers;
    connectedCalls;
    failedCalls;
    remoteResponse;
    errorMessage;
    startedAt;
    completedAt;
    durationSeconds;
    progressPercentage;
    statusDescription;
    createdAt;
    updatedAt;
}
__decorate([
    ApiProperty({ example: 'uuid' }),
    __metadata("design:type", String)
], SessionStatusDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: 'session-1738862891234-abc123' }),
    __metadata("design:type", String)
], SessionStatusDto.prototype, "sessionId", void 0);
__decorate([
    ApiProperty({
        enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
        example: 'COMPLETED'
    }),
    __metadata("design:type", String)
], SessionStatusDto.prototype, "status", void 0);
__decorate([
    ApiProperty({ example: 150, description: 'Jami raqamlar soni' }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "totalNumbers", void 0);
__decorate([
    ApiProperty({ example: 150, description: 'Qayta ishlangan raqamlar soni' }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "processedNumbers", void 0);
__decorate([
    ApiProperty({ example: 120, description: 'Muvaffaqiyatli qo\'ng\'iroqlar' }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "connectedCalls", void 0);
__decorate([
    ApiProperty({ example: 30, description: 'Muvaffaqiyatsiz qo\'ng\'iroqlar' }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "failedCalls", void 0);
__decorate([
    ApiProperty({
        example: 'Call process completed successfully',
        nullable: true,
        description: 'Remote serverdan qaytgan javob'
    }),
    __metadata("design:type", Object)
], SessionStatusDto.prototype, "remoteResponse", void 0);
__decorate([
    ApiProperty({
        example: null,
        nullable: true,
        description: 'Xato xabari (agar bo\'lsa)'
    }),
    __metadata("design:type", Object)
], SessionStatusDto.prototype, "errorMessage", void 0);
__decorate([
    ApiProperty({ example: '2025-10-06T18:30:00.000Z' }),
    __metadata("design:type", Date)
], SessionStatusDto.prototype, "startedAt", void 0);
__decorate([
    ApiProperty({
        example: '2025-10-06T18:32:15.000Z',
        nullable: true,
        description: 'Tugagan vaqti (agar tugagan bo\'lsa)'
    }),
    __metadata("design:type", Object)
], SessionStatusDto.prototype, "completedAt", void 0);
__decorate([
    ApiProperty({
        example: 135,
        description: 'Davomiyligi (sekundlarda)',
        nullable: true
    }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "durationSeconds", void 0);
__decorate([
    ApiProperty({
        example: 80,
        description: 'Jarayonning foizi (%)',
    }),
    __metadata("design:type", Number)
], SessionStatusDto.prototype, "progressPercentage", void 0);
__decorate([
    ApiProperty({
        example: 'Qayta ishlanmoqda...',
        description: 'Status tavsifi'
    }),
    __metadata("design:type", String)
], SessionStatusDto.prototype, "statusDescription", void 0);
__decorate([
    ApiProperty({ example: '2025-10-06T18:30:00.000Z' }),
    __metadata("design:type", Date)
], SessionStatusDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({ example: '2025-10-06T18:32:15.000Z' }),
    __metadata("design:type", Date)
], SessionStatusDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=session-status.dto.js.map