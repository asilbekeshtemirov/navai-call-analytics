import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UnifiedUserStatisticsDto } from './dto/unified-user-statistics.dto.js';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(organizationId: number, createUserDto: CreateUserDto): Promise<{
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
    }>;
    findAll(req: any, organizationId: number, branchId?: string, departmentId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        branch: {
            id: string;
            organizationId: number;
            name: string;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
        } | null;
    } & {
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
    })[]>;
    getUnifiedUserStatistics(id: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
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
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
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
    }>;
}
