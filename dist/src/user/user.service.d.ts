import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRole } from '@prisma/client';
import { StatisticsService } from '../statistics/statistics.service.js';
import { UnifiedUserStatisticsDto } from './dto/unified-user-statistics.dto.js';
export declare class UserService {
    private prisma;
    private statisticsService;
    constructor(prisma: PrismaService, statisticsService: StatisticsService);
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
    }>;
    findAll(organizationId?: number, filters?: {
        branchId?: string;
        departmentId?: string;
        excludeSuperAdmin?: boolean;
    }): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findOne(phone: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOneByOrganization(organizationId: number, phone: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOneById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUserRole(id: string, role: UserRole): Promise<{
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
    }>;
    getUnifiedUserStatistics(userId: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    private getFilteredUserDailyStats;
    private getFilteredUserMonthlyStats;
    private getFilteredUserSummary;
}
