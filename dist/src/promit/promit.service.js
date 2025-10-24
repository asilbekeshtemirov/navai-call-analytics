var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let PromitService = class PromitService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPromitDto) {
        const promit = await this.prisma.promit.create({
            data: createPromitDto,
        });
        return {
            message: 'Promit muvaffaqiyatli yaratildi',
            data: promit,
        };
    }
    async findAll() {
        const promits = await this.prisma.promit.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return promits;
    }
    async findOne(id) {
        const promit = await this.prisma.promit.findUnique({
            where: { id },
        });
        if (!promit) {
            throw new NotFoundException(`Promit (ID: ${id}) topilmadi`);
        }
        return promit;
    }
    async update(id, updatePromitDto) {
        const promit = await this.prisma.promit.findUnique({
            where: { id },
        });
        if (!promit) {
            throw new NotFoundException(`Promit (ID: ${id}) topilmadi`);
        }
        const updatedPromit = await this.prisma.promit.update({
            where: { id },
            data: updatePromitDto,
        });
        return {
            message: 'Promit muvaffaqiyatli yangilandi',
            data: updatedPromit,
        };
    }
    async remove(id) {
        const promit = await this.prisma.promit.findUnique({
            where: { id },
        });
        if (!promit) {
            throw new NotFoundException(`Promit (ID: ${id}) topilmadi`);
        }
        await this.prisma.promit.delete({
            where: { id },
        });
        return {
            message: 'Promit muvaffaqiyatli o\'chirildi',
        };
    }
};
PromitService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PromitService);
export { PromitService };
//# sourceMappingURL=promit.service.js.map