import { PrismaService } from '../../prisma/prisma.service.js';
export interface DebtCallContext {
    debtor: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    debt: {
        amount: number;
        currency: string;
        contractNumber: string;
        dueDate: string;
        daysOverdue: number;
        productService: string;
    };
    organization: {
        id: number;
        name: string;
    };
    callId: string;
    roomName: string;
    timestamp: string;
}
export declare class ContextBuilderService {
    private prisma;
    constructor(prisma: PrismaService);
    buildContext(debtorId: string, campaignId: string, roomName: string, assignmentId: string): Promise<DebtCallContext>;
    getContextByRoomName(roomName: string): Promise<DebtCallContext | null>;
    getContextByPhoneNumber(phone: string): Promise<DebtCallContext | null>;
}
