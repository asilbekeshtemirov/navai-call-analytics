export declare class CreateCampaignDto {
    name: string;
    description?: string;
    dailyCallStartHour?: number;
    dailyCallEndHour?: number;
    maxCallsPerDay?: number;
    debtorIds: string[];
}
