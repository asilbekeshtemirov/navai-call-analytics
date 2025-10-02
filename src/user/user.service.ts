import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { StatisticsService } from '../statistics/statistics.service.js';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private statisticsService: StatisticsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;
    const data: any = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUserRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // User statistika metodlari
  async getUserDailyStats(userId: string, dateStr: string) {
    // Avval user ni topamiz va uning extCode ni olamiz
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const date = new Date(dateStr);
    return this.statisticsService.getDailyStats(date, user.extCode || undefined);
  }

  async getUserMonthlyStats(userId: string, year: number, month: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.statisticsService.getMonthlyStats(year, month, user.extCode || undefined);
  }

  async getUserStatsSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [dailyStats, monthlyStats] = await Promise.all([
      this.statisticsService.getDailyStats(yesterday, user.extCode || undefined),
      this.statisticsService.getMonthlyStats(currentYear, currentMonth, user.extCode || undefined),
    ]);

    // User ma'lumotlari bilan birga statistikani qaytaramiz
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        extCode: user.extCode,
        role: user.role,
      },
      statistics: {
        daily: dailyStats,
        monthly: monthlyStats,
        summary: {
          totalCallsToday: dailyStats.reduce((sum: number, stat: any) => sum + stat.callsCount, 0),
          totalDurationToday: dailyStats.reduce((sum: number, stat: any) => sum + stat.totalDuration, 0),
          averageScoreToday: dailyStats.length > 0 
            ? dailyStats.reduce((sum: number, stat: any) => sum + (stat.averageScore || 0), 0) / dailyStats.length 
            : 0,
          totalCallsThisMonth: monthlyStats.reduce((sum: number, stat: any) => sum + stat.callsCount, 0),
          totalDurationThisMonth: monthlyStats.reduce((sum: number, stat: any) => sum + stat.totalDuration, 0),
          averageScoreThisMonth: monthlyStats.length > 0 
            ? monthlyStats.reduce((sum: number, stat: any) => sum + (stat.averageScore || 0), 0) / monthlyStats.length 
            : 0,
        }
      }
    };
  }
}
