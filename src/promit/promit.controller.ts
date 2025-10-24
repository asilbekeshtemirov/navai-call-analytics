import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromitService } from './promit.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';

@ApiTags('promit')
@ApiBearerAuth('access-token')
@Controller('promit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class PromitController {
  constructor(private readonly promitService: PromitService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi promit yaratish (faqat SuperAdmin)' })
  create(@Body() createPromitDto: CreatePromitDto) {
    return this.promitService.create(createPromitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha promitlarni olish (faqat SuperAdmin)' })
  findAll() {
    return this.promitService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta promitni olish (faqat SuperAdmin)' })
  findOne(@Param('id') id: string) {
    return this.promitService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Promitni yangilash (faqat SuperAdmin)' })
  update(@Param('id') id: string, @Body() updatePromitDto: UpdatePromitDto) {
    return this.promitService.update(id, updatePromitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Promitni o\'chirish (faqat SuperAdmin)' })
  remove(@Param('id') id: string) {
    return this.promitService.remove(id);
  }
}
