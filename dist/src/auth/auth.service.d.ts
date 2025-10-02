import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    signIn(phone: string, pass: string): Promise<{
        access_token: string;
    }>;
}
