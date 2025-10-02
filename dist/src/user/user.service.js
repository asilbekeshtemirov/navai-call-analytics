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
import * as bcrypt from 'bcrypt';
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const { password, ...rest } = createUserDto;
        return this.prisma.user.create({
            data: {
                ...rest,
                passwordHash: hashedPassword,
            },
        });
    }
    findAll() {
        return this.prisma.user.findMany();
    }
    findOne(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }
    findOneById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async update(id, updateUserDto) {
        const { password, ...rest } = updateUserDto;
        const data = { ...rest };
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async updateUserRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
};
UserService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map