import { CreateDebtorDto } from './create-debtor.dto.js';
declare enum DebtorStatus {
    ACTIVE = "ACTIVE",
    PAID = "PAID",
    DISPUTED = "DISPUTED",
    DO_NOT_CALL = "DO_NOT_CALL",
    LEGAL_ACTION = "LEGAL_ACTION"
}
declare const UpdateDebtorDto_base: import("@nestjs/common").Type<Partial<CreateDebtorDto>>;
export declare class UpdateDebtorDto extends UpdateDebtorDto_base {
    status?: DebtorStatus;
}
export {};
