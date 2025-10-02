import { DepartmentService } from './department.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    create(createDepartmentDto: CreateDepartmentDto): import("@prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        branchId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        branchId: string;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        branchId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): import("@prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        branchId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        branchId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
