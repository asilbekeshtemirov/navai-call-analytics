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
        const prompt = await this.prisma.systemPrompt.create({
            data: {
                ...createPromitDto,
                isActive: false,
            }, 2: 
        });
        return {
            message: 'Prompt muvaffaqiyatli yaratildi',
            data: prompt,
        };
    }
    async findAll() {
        const prompts = await this.prisma.systemPrompt.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return prompts;
    }
    async findOne(id) {
        const prompt = await this.prisma.systemPrompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new NotFoundException(`Prompt (ID: ${id}) topilmadi`);
        }
        return prompt;
    }
    async update(id, updatePromitDto) {
        const prompt = await this.prisma.systemPrompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new NotFoundException(`Prompt (ID: ${id}) topilmadi`);
        }
        if (updatePromitDto.isActive === true) {
            await this.prisma.systemPrompt.updateMany({
                where: {
                    id: { not: id },
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });
        }
        const updatedPrompt = await this.prisma.systemPrompt.update({
            where: { id },
            data: updatePromitDto,
        });
        return {
            message: 'Prompt muvaffaqiyatli yangilandi',
            data: updatedPrompt,
        };
    }
    async remove(id) {
        const prompt = await this.prisma.systemPrompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new NotFoundException(`Prompt (ID: ${id}) topilmadi`);
        }
        await this.prisma.systemPrompt.delete({
            where: { id },
        });
        return {
            message: 'Prompt muvaffaqiyatli o\'chirildi',
        };
    }
};
PromitService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PromitService);
export { PromitService };
//# sourceMappingURL=promit.service.js.map