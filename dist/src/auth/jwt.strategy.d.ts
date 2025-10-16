import { Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service.js';
interface JwtPayload {
    sub: string;
    phone: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    constructor(userService: UserService);
    validate(payload: JwtPayload): Promise<{
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
export {};
