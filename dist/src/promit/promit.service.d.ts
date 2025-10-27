import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';
export declare class PromitService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPromitDto: CreatePromitDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            content: string;
        };
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        content: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        content: string;
    }>;
    findActive(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        content: string;
    }>;
    update(id: string, updatePromitDto: UpdatePromitDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            content: string;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
