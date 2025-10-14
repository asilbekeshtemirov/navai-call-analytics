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
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    }>;
    findAll(req: any, organizationId: number, branchId?: string, departmentId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        branch: {
            id: string;
            createdAt: Date;
            name: string;
            organizationId: number;
            updatedAt: Date;
            address: string | null;
        } | null;
        department: {
            id: string;
            createdAt: Date;
            name: string;
            branchId: string;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    })[]>;
    getUnifiedUserStatistics(id: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
        id: string;
        createdAt: Date;
        organizationId: number;
        firstName: string;
        lastName: string;
        phone: string;
        extCode: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        branchId: string | null;
        departmentId: string | null;
        updatedAt: Date;
    }>;
}
