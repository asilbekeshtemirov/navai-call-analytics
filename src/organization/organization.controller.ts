import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';

@ApiTags('organizations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Yangi kompaniya yaratish (faqat SUPERADMIN)',
    description:
      "Yangi kompaniya, filial, bo'lim, admin foydalanuvchi va standart sozlamalarni yaratadi",
  })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: "Barcha kompaniyalarni ko'rish (faqat SUPERADMIN)" })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: "Bitta kompaniyani ko'rish (faqat SUPERADMIN)" })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(parseInt(id));
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: "Kompaniya holatini o'zgartirish (faqat SUPERADMIN)",
  })
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.organizationService.updateStatus(parseInt(id), isActive);
  }
}
