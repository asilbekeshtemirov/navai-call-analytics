import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { CallService } from './call.service.js';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';

@ApiTags('calls')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calls')
export class CallController {
  private readonly logger = new Logger(CallController.name);
  constructor(private readonly callService: CallService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all calls with filters' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Ixtiyoriy: Filial ID si bo\'yicha filter' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Ixtiyoriy: Bo\'lim ID si bo\'yicha filter' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Ixtiyoriy: Xodim ID si bo\'yicha filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Ixtiyoriy: Qo\'ng\'iroq holati bo\'yicha filter (UPLOADED, PROCESSING, DONE, ERROR)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Ixtiyoriy: Boshlanish sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Ixtiyoriy: Tugash sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.callService.findAll({
      branchId,
      departmentId,
      employeeId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get call by ID with full details' })
  findOne(@Param('id') id: string) {
    return this.callService.findOne(id);
  }

  @Get(':id/transcript')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get call transcript segments' })
  getTranscript(@Param('id') id: string) {
    return this.callService.getTranscript(id);
  }
}
