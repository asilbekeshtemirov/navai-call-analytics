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

@ApiTags('prompts')
@ApiBearerAuth('access-token')
@Controller('prompts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class PromitController {
  constructor(private readonly promitService: PromitService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi prompt yaratish (faqat SuperAdmin)' })
  create(@Body() createPromitDto: CreatePromitDto) {
    return this.promitService.create(createPromitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha promptlarni olish (faqat SuperAdmin)' })
  findAll() {
    return this.promitService.findAll();
  }

  @Get('active/current')
  @ApiOperation({ summary: 'Faol promptni olish (faqat SuperAdmin)' })
  findActive() {
    return this.promitService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta promptni olish (faqat SuperAdmin)' })
  findOne(@Param('id') id: string) {
    return this.promitService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Promptni yangilash (faqat SuperAdmin)' })
  update(@Param('id') id: string, @Body() updatePromitDto: UpdatePromitDto) {
    return this.promitService.update(id, updatePromitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Promptni o\'chirish (faqat SuperAdmin)' })
  remove(@Param('id') id: string) {
    return this.promitService.remove(id);
  }
}
