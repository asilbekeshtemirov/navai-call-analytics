export declare enum StatisticsType {
    DAILY = "daily",
    MONTHLY = "monthly",
    SUMMARY = "summary",
    ALL = "all"
}
export declare class UnifiedStatisticsDto {
    type?: StatisticsType;
    dateFrom?: string;
    dateTo?: string;
    extCode?: string;
}
