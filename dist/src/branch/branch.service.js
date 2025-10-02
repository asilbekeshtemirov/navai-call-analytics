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
let BranchService = class BranchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createBranchDto) {
        return this.prisma.branch.create({ data: createBranchDto });
    }
    findAll() {
        return this.prisma.branch.findMany({
            include: {
                departments: true,
                users: {
                    where: { role: 'MANAGER' },
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async getManagers() {
        const managers = await this.prisma.user.findMany({
            where: { role: 'MANAGER' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
        });
        return managers.map((m) => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            phone: m.phone,
        }));
    }
    findOne(id) {
        return this.prisma.branch.findUnique({
            where: { id },
            include: {
                departments: true,
                users: true,
            },
        });
    }
    update(id, updateBranchDto) {
        return this.prisma.branch.update({
            where: { id },
            data: updateBranchDto,
        });
    }
    remove(id) {
        return this.prisma.branch.delete({ where: { id } });
    }
};
BranchService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], BranchService);
export { BranchService };
//# sourceMappingURL=branch.service.js.map