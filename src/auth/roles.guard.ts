import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, User } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator.js';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified, allow access (JWT guard already validated authentication)
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug(
        '[ROLES] No roles specified - allowing access (authenticated users only)',
      );
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user) {
      this.logger.warn('[ROLES] No user found in request');
      return false;
    }

    // SUPERADMIN has access to everything
    if (user.role === UserRole.SUPERADMIN) {
      this.logger.debug(`[ROLES] SUPERADMIN access granted for ${user.phone}`);
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `[ROLES] Access denied - User: ${user.phone}, Role: ${user.role}, Required: ${requiredRoles.join(', ')}`,
      );
    } else {
      this.logger.debug(
        `[ROLES] Access granted - User: ${user.phone}, Role: ${user.role}`,
      );
    }

    return hasRole;
  }
}
