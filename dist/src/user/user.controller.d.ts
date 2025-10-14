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
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
    }>;
    findAll(req: any, organizationId: number, branchId?: string, departmentId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            name: string;
            address: string | null;
        } | null;
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            name: string;
        } | null;
    } & {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
    })[]>;
    getUnifiedUserStatistics(id: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
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
        organizationId: number;
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
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        branchId: string | null;
        departmentId: string | null;
    }>;
}
