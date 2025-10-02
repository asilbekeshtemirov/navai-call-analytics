import { Injectable } from '@nestjs/common';
import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CriteriaService {
  constructor(private prisma: PrismaService) {}

  create(createCriteriaDto: CreateCriteriaDto) {
    return this.prisma.criteria.create({ data: createCriteriaDto });
  }

  findAll() {
    return this.prisma.criteria.findMany();
  }

  findOne(id: string) {
    return this.prisma.criteria.findUnique({ where: { id } });
  }

  update(id: string, updateCriteriaDto: UpdateCriteriaDto) {
    return this.prisma.criteria.update({
      where: { id },
      data: updateCriteriaDto,
    });
  }

  remove(id: string) {
    return this.prisma.criteria.delete({ where: { id } });
  }
}
