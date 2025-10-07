import { OrganizationService } from './organization.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<{
        message: string;
        data: {
            organization: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string | null;
                isActive: boolean;
            };
            branch: {
                id: string;
                organizationId: number;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
            };
            adminUser: {
                id: string;
                firstName: string;
                lastName: string;
                phone: string;
                extCode: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        };
    }>;
    findAll(): Promise<({
        _count: {
            calls: number;
            users: number;
            branches: number;
            criteria: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<({
        _count: {
            calls: number;
            users: number;
            criteria: number;
        };
        branches: {
            id: string;
            organizationId: number;
            name: string;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isActive: boolean;
    }) | null>;
    updateStatus(id: string, isActive: boolean): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isActive: boolean;
    }>;
}
