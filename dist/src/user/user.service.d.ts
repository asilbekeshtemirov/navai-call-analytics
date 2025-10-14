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
    findAll(organizationId?: number, filters?: {
        branchId?: string;
        departmentId?: string;
        excludeSuperAdmin?: boolean;
    }): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(phone: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    findOneByOrganization(organizationId: number, phone: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    findOneById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    updateUserRole(id: string, role: UserRole): Promise<{
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
    getUnifiedUserStatistics(userId: string, filters: UnifiedUserStatisticsDto): Promise<any>;
    private getFilteredUserDailyStats;
    private getFilteredUserMonthlyStats;
    private getFilteredUserSummary;
}
