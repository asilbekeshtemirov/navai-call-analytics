import { PrismaService } from '../../prisma/prisma.service.js';
import { LiveKitIntegrationService } from '../services/livekit-integration.service.js';
export declare class PBXBridgeController {
    private readonly prisma;
    private readonly livekitService;
    private readonly logger;
    constructor(prisma: PrismaService, livekitService: LiveKitIntegrationService);
    lookupRoomByUser(data: {
        user?: string;
    }): Promise<{
        success: boolean;
        roomName: string;
        sipToken: string;
        debtorPhone: string;
        debtorId: string;
        debtorName: string;
        assignmentId: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        roomName?: undefined;
        sipToken?: undefined;
        debtorPhone?: undefined;
        debtorId?: undefined;
        debtorName?: undefined;
        assignmentId?: undefined;
    }>;
}
