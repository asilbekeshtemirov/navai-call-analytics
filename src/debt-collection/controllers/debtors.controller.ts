import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { OrganizationId } from '../../auth/organization-id.decorator.js';
import { DebtorService } from '../services/debtor.service.js';
import { CreateDebtorDto } from '../dto/create-debtor.dto.js';
import { UpdateDebtorDto } from '../dto/update-debtor.dto.js';
import { UserRole } from '@prisma/client';

@ApiTags('Debt Collection - Debtors')
@Controller('debt-collection/debtors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DebtorsController {
  constructor(private readonly debtorService: DebtorService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new debtor' })
  create(
    @OrganizationId() organizationId: number,
    @Body() createDebtorDto: CreateDebtorDto,
  ) {
    return this.debtorService.create(organizationId, createDebtorDto);
  }

  @Post('bulk-import')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Bulk import debtors from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx) containing debtor information',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(
    @OrganizationId() organizationId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.debtorService.bulkImport(organizationId, file);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all debtors with filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by debtor status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, phone, or email' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 50)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip (default: 0)' })
  findAll(
    @OrganizationId() organizationId: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const filters = {
      status,
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    };
    return this.debtorService.findAll(organizationId, filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get debtor by ID' })
  findOne(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    return this.debtorService.findOne(id, organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update debtor' })
  update(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
    @Body() updateDebtorDto: UpdateDebtorDto,
  ) {
    return this.debtorService.update(id, organizationId, updateDebtorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete debtor' })
  remove(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    return this.debtorService.remove(id, organizationId);
  }
}
