import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class CriteriaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCriteriaDto: CreateCriteriaDto): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        weight: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        weight: number;
        description: string | null;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        weight: number;
        description: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCriteriaDto: UpdateCriteriaDto): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        weight: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        weight: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
