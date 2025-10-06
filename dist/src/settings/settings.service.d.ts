import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        sipuniApiUrl: string | null;
        sipuniApiKey: string | null;
        sipuniUserId: string | null;
        dataSource: import("@prisma/client").$Enums.DataSource;
        id: number;
        updatedAt: Date;
    }>;
    update(updateSettingsDto: UpdateSettingsDto): Promise<{
        analyticsStatus: boolean;
        scoringMode: import("@prisma/client").$Enums.ScoringMode;
        excludeSeconds: number;
        pbxUrl: string | null;
        language: string | null;
        sipuniApiUrl: string | null;
        sipuniApiKey: string | null;
        sipuniUserId: string | null;
        dataSource: import("@prisma/client").$Enums.DataSource;
        id: number;
        updatedAt: Date;
    }>;
}
