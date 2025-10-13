var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RolesGuard_1;
import { Injectable, Logger, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator.js';
let RolesGuard = RolesGuard_1 = class RolesGuard {
    reflector;
    logger = new Logger(RolesGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles || requiredRoles.length === 0) {
            this.logger.debug('[ROLES] No roles specified - allowing access (authenticated users only)');
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            this.logger.warn('[ROLES] No user found in request');
            return false;
        }
        if (user.role === UserRole.SUPERADMIN) {
            this.logger.debug(`[ROLES] SUPERADMIN access granted for ${user.phone}`);
            return true;
        }
        const hasRole = requiredRoles.some((role) => user.role === role);
        if (!hasRole) {
            this.logger.warn(`[ROLES] Access denied - User: ${user.phone}, Role: ${user.role}, Required: ${requiredRoles.join(', ')}`);
        }
        else {
            this.logger.debug(`[ROLES] Access granted - User: ${user.phone}, Role: ${user.role}`);
        }
        return hasRole;
    }
};
RolesGuard = RolesGuard_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map