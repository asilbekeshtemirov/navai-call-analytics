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
                slug: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            branch: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: number;
                address: string | null;
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
            branches: number;
            users: number;
            calls: number;
            criteria: number;
        };
    } & {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        branches: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            address: string | null;
        }[];
        _count: {
            users: number;
            calls: number;
            criteria: number;
        };
    } & {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateStatus(id: string, isActive: boolean): Promise<{
        id: number;
        slug: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
