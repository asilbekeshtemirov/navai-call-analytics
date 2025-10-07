import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    phone: string;
    extCode?: string;
    password: string;
    role?: UserRole;
    branchId?: string;
    departmentId?: string;
}
