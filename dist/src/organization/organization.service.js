var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrganizationService_1;
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
let OrganizationService = OrganizationService_1 = class OrganizationService {
    prisma;
    logger = new Logger(OrganizationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrganizationDto) {
        this.logger.log(`Creating new organization: ${createOrganizationDto.name}`);
        const existingOrg = await this.prisma.organization.findUnique({
            where: { slug: createOrganizationDto.slug },
        });
        if (existingOrg) {
            throw new ConflictException(`Organization with slug "${createOrganizationDto.slug}" already exists`);
        }
        const existingUser = await this.prisma.user.findFirst({
            where: { phone: createOrganizationDto.adminPhone },
        });
        if (existingUser) {
            throw new ConflictException(`User with phone "${createOrganizationDto.adminPhone}" already exists`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: createOrganizationDto.name,
                    slug: createOrganizationDto.slug,
                    description: createOrganizationDto.description,
                    isActive: true,
                },
            });
            this.logger.log(`Organization created: ${organization.id}`);
            const branch = await tx.branch.create({
                data: {
                    organizationId: organization.id,
                    name: createOrganizationDto.branchName,
                    address: createOrganizationDto.branchAddress,
                },
            });
            const department = await tx.department.create({
                data: {
                    branchId: branch.id,
                    name: createOrganizationDto.departmentName,
                },
            });
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
            await tx.setting.create({
                data: {
                    organizationId: organization.id,
                    analyticsStatus: true,
                    scoringMode: 'TEN',
                    excludeSeconds: 0,
                    language: 'uz',
                    syncSchedule: '50 23 * * *',
                    autoSyncOnStartup: true,
                },
            });
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
    async findOne(id) {
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
    async updateStatus(id, isActive) {
        return this.prisma.organization.update({
            where: { id },
            data: { isActive },
        });
    }
};
OrganizationService = OrganizationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OrganizationService);
export { OrganizationService };
//# sourceMappingURL=organization.service.js.map