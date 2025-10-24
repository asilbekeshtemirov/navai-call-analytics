import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';
export declare class PromitService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPromitDto: CreatePromitDto): Promise<{
        message: string;
        data: {
            content: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(): Promise<{
        content: string;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        content: string;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updatePromitDto: UpdatePromitDto): Promise<{
        message: string;
        data: {
            content: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
