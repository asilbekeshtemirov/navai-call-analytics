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

@ApiTags('branches')
@ApiBearerAuth('access-token')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha filiallarni olish' })
  findAll() {
    return this.branchService.findAll();
  }

  @Get('managers')
  @ApiOperation({ summary: 'Barcha menejerlarni olish (dropdown uchun)' })
  getManagers() {
    return this.branchService.getManagers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta filialni olish' })
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
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
