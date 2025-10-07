import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizationId: number, createBranchDto: CreateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(organizationId: number): import("@prisma/client").Prisma.PrismaPromise<({
        users: {
            id: string;
            firstName: string;
            lastName: string;
        }[];
        departments: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        address: string | null;
    })[]>;
    getManagers(organizationId: number): Promise<{
        id: string;
        name: string;
        phone: string;
    }[]>;
    findOne(organizationId: number, id: string): import("@prisma/client").Prisma.Prisma__BranchClient<({
        users: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            branchId: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
        }[];
        departments: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        address: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateBranchDto: UpdateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
