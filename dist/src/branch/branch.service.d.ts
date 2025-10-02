import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBranchDto: CreateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        updatedAt: Date;
        name: string;
        address: string | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        departments: {
            id: string;
            updatedAt: Date;
            name: string;
            createdAt: Date;
            branchId: string;
        }[];
        users: {
            id: string;
            firstName: string;
            lastName: string;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        address: string | null;
        createdAt: Date;
    })[]>;
    getManagers(): Promise<{
        id: string;
        name: string;
        phone: string;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__BranchClient<({
        departments: {
            id: string;
            updatedAt: Date;
            name: string;
            createdAt: Date;
            branchId: string;
        }[];
        users: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            branchId: string | null;
            phone: string;
            firstName: string;
            lastName: string;
            extCode: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            passwordHash: string;
            departmentId: string | null;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        address: string | null;
        createdAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateBranchDto: UpdateBranchDto): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        updatedAt: Date;
        name: string;
        address: string | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BranchClient<{
        id: string;
        updatedAt: Date;
        name: string;
        address: string | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
