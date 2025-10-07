import { Injectable } from '@nestjs/common';
import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CriteriaService {
  constructor(private prisma: PrismaService) {}

  create(organizationId: number, createCriteriaDto: CreateCriteriaDto) {
    return this.prisma.criteria.create({
      data: {
        ...createCriteriaDto,
        organizationId, // Multi-tenancy
      },
    });
  }

  findAll(organizationId: number) {
    return this.prisma.criteria.findMany({
      where: { organizationId }, // Multi-tenancy filter
    });
  }

  findOne(organizationId: number, id: string) {
    return this.prisma.criteria.findFirst({
      where: {
        id,
        organizationId, // Multi-tenancy: Ensure criteria belongs to user's organization
      },
    });
  }

  update(organizationId: number, id: string, updateCriteriaDto: UpdateCriteriaDto) {
    return this.prisma.criteria.update({
      where: { id },
      data: updateCriteriaDto,
    });
  }

  remove(organizationId: number, id: string) {
    return this.prisma.criteria.delete({
      where: { id },
    });
  }
}
