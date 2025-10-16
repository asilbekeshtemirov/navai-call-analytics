import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizationId: number, createBranchDto: CreateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        organizationId: number;
        name: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(organizationId: number): import("@prisma/client").Prisma.PrismaPromise<({
        departments: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        }[];
        users: {
            id: string;
            firstName: string;
            lastName: string;
        }[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getManagers(organizationId: number): Promise<{
        id: string;
        name: string;
        phone: string;
    }[]>;
    findOne(organizationId: number, id: string): import("@prisma/client").Prisma.Prisma__BranchClient<({
        departments: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        }[];
        users: {
            id: string;
            organizationId: number;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            extCode: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
            auto_calling: boolean;
        }[];
    } & {
        id: string;
        organizationId: number;
        name: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateBranchDto: UpdateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        organizationId: number;
        name: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        organizationId: number;
        name: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
