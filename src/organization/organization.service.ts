import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    this.logger.log(`Creating new organization: ${createOrganizationDto.name}`);

    // Check if slug already exists
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: createOrganizationDto.slug },
    });

    if (existingOrg) {
      throw new ConflictException(`Organization with slug "${createOrganizationDto.slug}" already exists`);
    }

    // Check if phone already exists (across all organizations)
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: createOrganizationDto.adminPhone },
    });

    if (existingUser) {
      throw new ConflictException(`User with phone "${createOrganizationDto.adminPhone}" already exists`);
    }

    // Create organization with related data in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create organization
      const organization = await tx.organization.create({
        data: {
          name: createOrganizationDto.name,
          slug: createOrganizationDto.slug,
          description: createOrganizationDto.description,
          isActive: true,
        },
      });

      this.logger.log(`Organization created: ${organization.id}`);

      // 2. Create branch
      const branch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: createOrganizationDto.branchName,
          address: createOrganizationDto.branchAddress,
        },
      });

      // 3. Create department
      const department = await tx.department.create({
        data: {
          branchId: branch.id,
          name: createOrganizationDto.departmentName,
        },
      });

      // 4. Create admin user
      const hashedPassword = await bcrypt.hash(createOrganizationDto.adminPassword, 10);
      const adminUser = await tx.user.create({
        data: {
          organizationId: organization.id,
          firstName: createOrganizationDto.adminFirstName,
          lastName: createOrganizationDto.adminLastName,
          phone: createOrganizationDto.adminPhone,
          extCode: createOrganizationDto.adminExtCode,
          role: 'ADMIN',
          passwordHash: hashedPassword,
          branchId: branch.id,
          departmentId: department.id,
        },
      });

      // 5. Create default settings
      await tx.setting.create({
        data: {
          organizationId: organization.id,
          analyticsStatus: true,
          scoringMode: 'TEN',
          excludeSeconds: 0,
          language: 'uz',
          syncSchedule: '50 23 * * *',  // Default: 23:50 daily
          autoSyncOnStartup: true,       // Auto-sync from month start on startup
        },
      });

      // 6. Create default criteria
      const defaultCriteria = [
        { name: 'Приветствие', weight: 1, description: 'Дружелюбное приветствие клиента' },
        { name: 'Выявление потребностей', weight: 2, description: 'Выяснение потребностей клиента' },
        { name: 'Презентация продукта/услуги', weight: 2, description: 'Четкое описание продукта' },
        { name: 'Работа с возражениями', weight: 2, description: 'Ответы на вопросы клиента' },
        { name: 'Завершение разговора', weight: 1, description: 'Профессиональное завершение звонка' },
      ];

      for (const criteria of defaultCriteria) {
        await tx.criteria.create({
          data: {
            organizationId: organization.id,
            ...criteria,
          },
        });
      }

      this.logger.log(`Organization setup completed: ${organization.name}`);

      return {
        organization,
        branch,
        department,
        adminUser: {
          id: adminUser.id,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          phone: adminUser.phone,
          extCode: adminUser.extCode,
          role: adminUser.role,
        },
      };
    });

    return {
      message: 'Organization created successfully',
      data: result,
    };
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            calls: true,
            branches: true,
            criteria: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        branches: true,
        _count: {
          select: {
            users: true,
            calls: true,
            criteria: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    return this.prisma.organization.update({
      where: { id },
      data: { isActive },
    });
  }
}
