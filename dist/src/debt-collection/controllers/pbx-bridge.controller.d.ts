import { PrismaService } from '../../prisma/prisma.service.js';
export declare class PBXBridgeController {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    lookupRoomByUser(data: {
        user: string;
    }): Promise<{
        success: boolean;
        roomName: string | null;
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
        debtorPhone?: undefined;
        debtorId?: undefined;
        debtorName?: undefined;
        assignmentId?: undefined;
    }>;
}
