import { TopicService } from './topic.service.js';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
export declare class TopicController {
    private readonly topicService;
    constructor(topicService: TopicService);
    create(createTopicDto: CreateTopicDto): import("@prisma/client").Prisma.Prisma__TopicClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__TopicClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateTopicDto: UpdateTopicDto): import("@prisma/client").Prisma.Prisma__TopicClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__TopicClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
