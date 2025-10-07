declare enum ScoringMode {
    TEN = "TEN",
    HUNDRED = "HUNDRED"
}
declare enum DataSource {
    PBX = "PBX",
    SIPUNI = "SIPUNI"
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
    sipuniApiUrl?: string;
    sipuniApiKey?: string;
    sipuniUserId?: string;
    dataSource?: DataSource;
    syncSchedule?: string;
    autoSyncOnStartup?: boolean;
}
export {};
