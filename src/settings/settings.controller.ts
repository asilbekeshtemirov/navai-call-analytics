import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system settings' })
  get(@OrganizationId() organizationId: number) {
    return this.settingsService.get(organizationId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update system settings' })
  update(
    @OrganizationId() organizationId: number,
    @Body() updateSettingsDto: UpdateSettingsDto
  ) {
    return this.settingsService.update(organizationId, updateSettingsDto);
  }
}
