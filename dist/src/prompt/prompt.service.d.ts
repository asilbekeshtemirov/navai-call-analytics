import { CreatePromptDto } from './dto/create-prompt.dto.js';
import { UpdatePromptDto } from './dto/update-prompt.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class PromptService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPromptDto: CreatePromptDto): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        text: string;
        topicId: string;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        text: string;
        topicId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updatePromptDto: UpdatePromptDto): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
