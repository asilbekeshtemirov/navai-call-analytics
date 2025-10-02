declare enum ScoringMode {
    TEN = "TEN",
    HUNDRED = "HUNDRED"
}
export declare class UpdateSettingsDto {
    analyticsStatus?: boolean;
    scoringMode?: ScoringMode;
    excludeSeconds?: number;
    pbxUrl?: string;
    language?: string;
    sipApiUrl?: string;
    sipApiKey?: string;
    sttApiUrl?: string;
    geminiApiKey?: string;
}
export {};
