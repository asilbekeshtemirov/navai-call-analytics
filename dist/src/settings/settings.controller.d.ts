import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<{
        id: number;
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        updatedAt: Date;
    }>;
    update(updateSettingsDto: UpdateSettingsDto): Promise<{
        id: number;
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        updatedAt: Date;
    }>;
}
