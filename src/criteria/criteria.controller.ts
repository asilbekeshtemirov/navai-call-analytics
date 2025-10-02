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

@ApiTags('criteria')
@ApiBearerAuth('access-token')
@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  create(@Body() createCriteriaDto: CreateCriteriaDto) {
    return this.criteriaService.create(createCriteriaDto);
  }

  @Get()
  findAll() {
    return this.criteriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.criteriaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCriteriaDto: UpdateCriteriaDto,
  ) {
    return this.criteriaService.update(id, updateCriteriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.criteriaService.remove(id);
  }
}
