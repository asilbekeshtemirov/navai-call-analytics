import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDebtorDto } from '../dto/create-debtor.dto.js';
import { UpdateDebtorDto } from '../dto/update-debtor.dto.js';
import ExcelJS from 'exceljs';

@Injectable()
export class DebtorService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: number, dto: CreateDebtorDto) {
    // Calculate days overdue
    const dueDate = new Date(dto.dueDate);
    const today = new Date();
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    return this.prisma.debtor.create({
      data: {
        organizationId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        debtAmount: dto.debtAmount,
        currency: dto.currency || 'UZS',
        contractNumber: dto.contractNumber,
        dueDate: new Date(dto.dueDate),
        daysOverdue,
        productService: dto.productService,
        debtReason: dto.debtReason,
      },
    });
  }

  async findAll(organizationId: number, filters?: any) {
    const where: any = { organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { contractNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [debtors, total] = await Promise.all([
      this.prisma.debtor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.skip || 0,
      }),
      this.prisma.debtor.count({ where }),
    ]);

    return { debtors, total };
  }

  async findOne(id: string, organizationId: number) {
    const debtor = await this.prisma.debtor.findFirst({
      where: { id, organizationId },
      include: {
        campaignAssignments: {
          include: {
            campaign: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!debtor) {
      throw new NotFoundException('Qarzdor topilmadi');
    }

    return debtor;
  }

  async update(id: string, organizationId: number, dto: UpdateDebtorDto) {
    const debtor = await this.findOne(id, organizationId);

    // Check if contract number is being updated and if it already exists
    if (dto.contractNumber && dto.contractNumber !== debtor.contractNumber) {
      const existing = await this.prisma.debtor.findFirst({
        where: {
          organizationId,
          contractNumber: dto.contractNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Shartnoma raqami "${dto.contractNumber}" allaqachon mavjud`
        );
      }
    }

    const updateData: any = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.alternatePhone !== undefined) updateData.alternatePhone = dto.alternatePhone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.debtAmount !== undefined) updateData.debtAmount = dto.debtAmount;
    if (dto.currency) updateData.currency = dto.currency;
    if (dto.contractNumber) updateData.contractNumber = dto.contractNumber;
    if (dto.productService) updateData.productService = dto.productService;
    if (dto.debtReason !== undefined) updateData.debtReason = dto.debtReason;
    if (dto.status) updateData.status = dto.status;

    if (dto.dueDate) {
      const dueDate = new Date(dto.dueDate);
      const today = new Date();
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      updateData.dueDate = dueDate;
      updateData.daysOverdue = daysOverdue;
    }

    try {
      return await this.prisma.debtor.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Shartnoma raqami yoki telefon raqami allaqachon mavjud'
        );
      }
      throw error;
    }
  }

  async remove(id: string, organizationId: number) {
    const debtor = await this.findOne(id, organizationId);

    return this.prisma.debtor.delete({
      where: { id },
    });
  }

  async bulkImport(organizationId: number, file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Excel fayl bo\'sh');
    }

    const debtors: CreateDebtorDto[] = [];
    const errors: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      try {
        const debtor: CreateDebtorDto = {
          firstName: row.getCell(1).value?.toString() || '',
          lastName: row.getCell(2).value?.toString() || '',
          phone: row.getCell(3).value?.toString() || '',
          alternatePhone: row.getCell(4).value?.toString(),
          email: row.getCell(5).value?.toString(),
          debtAmount: parseFloat(row.getCell(6).value?.toString() || '0'),
          currency: row.getCell(7).value?.toString() || 'UZS',
          contractNumber: row.getCell(8).value?.toString() || '',
          dueDate: this.parseExcelDate(row.getCell(9).value),
          productService: row.getCell(10).value?.toString() || '',
          debtReason: row.getCell(11).value?.toString(),
        };

        if (!debtor.firstName || !debtor.lastName || !debtor.phone || !debtor.contractNumber) {
          errors.push(`Qator ${rowNumber}: Ma'lumotlar to'liq emas`);
          return;
        }

        debtors.push(debtor);
      } catch (error) {
        errors.push(`Qator ${rowNumber}: ${error.message}`);
      }
    });

    // Create debtors
    const created = [];
    const failed = [];

    for (const debtor of debtors) {
      try {
        const result = await this.create(organizationId, debtor);
        created.push(result);
      } catch (error) {
        failed.push({
          debtor,
          error: error.message,
        });
      }
    }

    return {
      success: created.length,
      failed: failed.length,
      errors: [...errors, ...failed.map(f => f.error)],
      created,
    };
  }

  private parseExcelDate(value: any): string {
    if (!value) {
      throw new Error('Muddat ko\'rsatilmagan');
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      // Excel date serial number
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }

    throw new Error('Noto\'g\'ri sana formati');
  }

  async updateCallAttempts(id: string, outcome: string) {
    return this.prisma.debtor.update({
      where: { id },
      data: {
        callAttempts: { increment: 1 },
        lastContactDate: new Date(),
        lastContactOutcome: outcome,
      },
    });
  }
}
