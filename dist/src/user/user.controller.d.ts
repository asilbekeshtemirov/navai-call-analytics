import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UnifiedUserStatisticsDto } from './dto/unified-user-statistics.dto.js';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
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
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    getUnifiedUserStatistics(id: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
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
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
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
    }>;
}
