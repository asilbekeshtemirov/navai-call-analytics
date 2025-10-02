import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
export declare class PbxService {
    private prisma;
    private aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    handleHistory(data: any): Promise<{
        status: string;
        call_id: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
        call_id?: undefined;
    }>;
    handleEvent(data: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleContact(data: any): Promise<{
        contact_name: string;
        responsible: string;
        status?: undefined;
        message?: undefined;
    } | {
        status: string;
        message: any;
        contact_name?: undefined;
        responsible?: undefined;
    }>;
    handleRating(data: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
}
