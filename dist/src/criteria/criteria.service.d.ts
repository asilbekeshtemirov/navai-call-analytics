import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class CriteriaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizationId: number, createCriteriaDto: CreateCriteriaDto): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weight: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(organizationId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weight: number;
    }[]>;
    findOne(organizationId: number, id: string): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weight: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(organizationId: number, id: string, updateCriteriaDto: UpdateCriteriaDto): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weight: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(organizationId: number, id: string): import("@prisma/client").Prisma.Prisma__CriteriaClient<{
        id: string;
        organizationId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weight: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
