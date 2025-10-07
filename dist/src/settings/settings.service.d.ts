import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
