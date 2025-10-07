import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(organizationId: number) {
    let settings = await this.prisma.setting.findFirst({
      where: { organizationId }, // Multi-tenancy filter
    });

    // Create default settings if none exist for this organization
    if (!settings) {
      settings = await this.prisma.setting.create({
        data: {
          organizationId, // Multi-tenancy
          analyticsStatus: true,
          scoringMode: 'TEN',
          excludeSeconds: 0,
          pbxUrl: null,
          language: 'uz',
        },
      });
    }

    return settings;
  }

  async update(organizationId: number, updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.get(organizationId);

    return this.prisma.setting.update({
      where: { id: settings.id },
      data: updateSettingsDto,
    });
  }
}
