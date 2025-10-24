import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';

@Injectable()
export class PromitService {
  constructor(private prisma: PrismaService) {}

  async create(createPromitDto: CreatePromitDto) {
    // Yangi prompt yaratilganda, default holatda nofaol bo'ladi
    const prompt = await this.prisma.systemPrompt.create({
      data: {
        ...createPromitDto,
        isActive: false, // Yangi promptlar default nofaol
      },
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

  async findOne(id: string) {
    const prompt = await this.prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt (ID: ${id}) topilmadi`);
    }

    return prompt;
  }

  async findActive() {
    const activePrompt = await this.prisma.systemPrompt.findFirst({
      where: { isActive: true },
    });

    if (!activePrompt) {
      throw new NotFoundException('Faol prompt topilmadi');
    }

    return activePrompt;
  }

  async update(id: string, updatePromitDto: UpdatePromitDto) {
    const prompt = await this.prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt (ID: ${id}) topilmadi`);
    }

    // Agar prompt faol qilinayotgan bo'lsa, boshqa barcha promptlarni nofaol qilish
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

  async remove(id: string) {
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
}
