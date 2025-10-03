export declare enum StatisticsType {
    OVERVIEW = "overview",
    DAILY = "daily",
    MONTHLY = "monthly",
    DASHBOARD = "dashboard",
    ALL = "all"
}
export declare class UnifiedStatisticsDto {
    type?: StatisticsType;
    dateFrom?: string;
    dateTo?: string;
    extCode?: string;
    employeeId?: string;
    departmentId?: string;
    branchId?: string;
}
