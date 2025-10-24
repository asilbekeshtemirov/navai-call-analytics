import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';

@Injectable()
export class PromitService {
  constructor(private prisma: PrismaService) {}

  async create(createPromitDto: CreatePromitDto) {
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

  async findOne(id: string) {
    const promit = await this.prisma.promit.findUnique({
      where: { id },
    });

    if (!promit) {
      throw new NotFoundException(`Promit (ID: ${id}) topilmadi`);
    }

    return promit;
  }

  async update(id: string, updatePromitDto: UpdatePromitDto) {
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

  async remove(id: string) {
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
}
