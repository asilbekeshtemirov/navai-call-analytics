import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    }[]>;
    findOne(phone: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOneById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, role: UserRole): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        departmentId: string | null;
    }>;
}
