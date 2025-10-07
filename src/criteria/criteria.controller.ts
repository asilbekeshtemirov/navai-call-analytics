import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CriteriaService } from './criteria.service.js';
import { CreateCriteriaDto } from './dto/create-criteria.dto.js';
import { UpdateCriteriaDto } from './dto/update-criteria.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('criteria')
@ApiBearerAuth('access-token')
@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  create(
    @OrganizationId() organizationId: number,
    @Body() createCriteriaDto: CreateCriteriaDto
  ) {
    return this.criteriaService.create(organizationId, createCriteriaDto);
  }

  @Get()
  findAll(@OrganizationId() organizationId: number) {
    return this.criteriaService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @OrganizationId() organizationId: number,
    @Param('id') id: string
  ) {
    return this.criteriaService.findOne(organizationId, id);
  }

  @Patch(':id')
  update(
    @OrganizationId() organizationId: number,
    @Param('id') id: string,
    @Body() updateCriteriaDto: UpdateCriteriaDto,
  ) {
    return this.criteriaService.update(organizationId, id, updateCriteriaDto);
  }

  @Delete(':id')
  remove(
    @OrganizationId() organizationId: number,
    @Param('id') id: string
  ) {
    return this.criteriaService.remove(organizationId, id);
  }
}
