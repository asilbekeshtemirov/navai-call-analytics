import { Injectable } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto.js';
import { UpdatePromptDto } from './dto/update-prompt.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  create(createPromptDto: CreatePromptDto) {
    return this.prisma.prompt.create({ data: createPromptDto });
  }

  findAll() {
    return this.prisma.prompt.findMany();
  }

  findOne(id: string) {
    return this.prisma.prompt.findUnique({ where: { id } });
  }

  update(id: string, updatePromptDto: UpdatePromptDto) {
    return this.prisma.prompt.update({
      where: { id },
      data: updatePromptDto,
    });
  }

  remove(id: string) {
    return this.prisma.prompt.delete({ where: { id } });
  }
}
