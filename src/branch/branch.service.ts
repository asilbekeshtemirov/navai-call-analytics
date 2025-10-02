import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  create(createBranchDto: CreateBranchDto) {
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

    return managers.map(
      (m: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
      }) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        phone: m.phone,
      }),
    );
  }

  findOne(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        departments: true,
        users: true,
      },
    });
  }

  update(id: string, updateBranchDto: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  remove(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}
