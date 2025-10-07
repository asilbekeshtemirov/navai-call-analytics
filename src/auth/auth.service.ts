import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(phone: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(phone);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId  // Added for multi-tenancy
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
