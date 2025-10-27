declare enum DebtCallOutcome {
    PROMISE = "PROMISE",
    DISPUTED = "DISPUTED",
    REFUSED = "REFUSED",
    NO_ANSWER = "NO_ANSWER",
    WRONG_NUMBER = "WRONG_NUMBER",
    CALLBACK_REQUESTED = "CALLBACK_REQUESTED",
    PAID = "PAID"
}
export declare class RecordOutcomeDto {
    outcome: DebtCallOutcome;
    promisedAmount?: number;
    promisedDate?: string;
    notes?: string;
}
export {};
