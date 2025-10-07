var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let CriteriaService = class CriteriaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(organizationId, createCriteriaDto) {
        return this.prisma.criteria.create({
            data: {
                ...createCriteriaDto,
                organizationId,
            },
        });
    }
    findAll(organizationId) {
        return this.prisma.criteria.findMany({
            where: { organizationId },
        });
    }
    findOne(organizationId, id) {
        return this.prisma.criteria.findFirst({
            where: {
                id,
                organizationId,
            },
        });
    }
    update(organizationId, id, updateCriteriaDto) {
        return this.prisma.criteria.update({
            where: { id },
            data: updateCriteriaDto,
        });
    }
    remove(organizationId, id) {
        return this.prisma.criteria.delete({
            where: { id },
        });
    }
};
CriteriaService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CriteriaService);
export { CriteriaService };
//# sourceMappingURL=criteria.service.js.map