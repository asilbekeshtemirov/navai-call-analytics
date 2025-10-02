import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants.js';
import { UserService } from '../user/user.service.js'; // Assuming user service is needed to validate user

interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Here, `payload` contains the decoded JWT payload (sub, phone, role)
    // You can fetch the user from the database to ensure they still exist and are active
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Attach the user object to the request
    return user;
  }
}
