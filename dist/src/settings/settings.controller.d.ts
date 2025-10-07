import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(organizationId: number): Promise<{
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        sipuniApiUrl: string | null;
        sipuniApiKey: string | null;
        sipuniUserId: string | null;
        dataSource: import("@prisma/client").$Enums.DataSource;
        syncSchedule: string | null;
        autoSyncOnStartup: boolean;
    }>;
    update(organizationId: number, updateSettingsDto: UpdateSettingsDto): Promise<{
        id: string;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        sipuniApiUrl: string | null;
        sipuniApiKey: string | null;
        sipuniUserId: string | null;
        dataSource: import("@prisma/client").$Enums.DataSource;
        syncSchedule: string | null;
        autoSyncOnStartup: boolean;
    }>;
}
