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
        branchId: string | null;
        departmentId: string | null;
        createdAt: Date;
        extCode: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        updatedAt: Date;
    }>;
}
export {};
