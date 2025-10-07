import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchService } from './branch.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('branches')
@ApiBearerAuth('access-token')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  create(
    @OrganizationId() organizationId: number,
    @Body() createBranchDto: CreateBranchDto
  ) {
    return this.branchService.create(organizationId, createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha filiallarni olish' })
  findAll(@OrganizationId() organizationId: number) {
    return this.branchService.findAll(organizationId);
  }

  @Get('managers')
  @ApiOperation({ summary: 'Barcha menejerlarni olish (dropdown uchun)' })
  getManagers(@OrganizationId() organizationId: number) {
    return this.branchService.getManagers(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta filialni olish' })
  findOne(
    @OrganizationId() organizationId: number,
    @Param('id') id: string
  ) {
    return this.branchService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Filialni yangilash' })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Filialni o'chirish" })
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
