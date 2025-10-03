export declare enum UserStatisticsType {
    DAILY = "daily",
    MONTHLY = "monthly",
    SUMMARY = "summary",
    ALL = "all"
}
export declare class UnifiedUserStatisticsDto {
    type?: UserStatisticsType;
    dateFrom?: string;
    dateTo?: string;
}
