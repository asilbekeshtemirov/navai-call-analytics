import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role?: UserRole;
    branchId?: string;
    departmentId?: string;
}
