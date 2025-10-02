import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.setting.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.setting.create({
        data: {
          id: 1,
          analyticsStatus: true,
          scoringMode: 'TEN',
          excludeSeconds: 0,
          pbxUrl: null,
          language: 'rus',
        },
      });
    }
    
    return settings;
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.get();
    
    return this.prisma.setting.update({
      where: { id: settings.id },
      data: updateSettingsDto,
    });
  }
}
