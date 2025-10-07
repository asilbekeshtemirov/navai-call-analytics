import { PromptService } from './prompt.service.js';
import { CreatePromptDto } from './dto/create-prompt.dto.js';
import { UpdatePromptDto } from './dto/update-prompt.dto.js';
export declare class PromptController {
    private readonly promptService;
    constructor(promptService: PromptService);
    create(createPromptDto: CreatePromptDto): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        topicId: string;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        topicId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updatePromptDto: UpdatePromptDto): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__PromptClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        topicId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
