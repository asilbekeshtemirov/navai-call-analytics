import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CallService } from './call.service.js';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Public } from '../auth/public.decorator.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';

export const numbersStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './numbers';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

@ApiTags('calls')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calls')
export class CallController {
  private readonly logger = new Logger(CallController.name);
  constructor(private readonly callService: CallService) {}

  @Public()
  @Post('upload')
  @ApiOperation({ summary: 'Upload .xlsx or .txt file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'An .xlsx or .txt file containing numbers.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: numbersStorage }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.callService.uploadFile(file);
  }

  @Public()
  @Post('start')
  @ApiOperation({ summary: 'Start remote process' })
  startProcess() {
    return this.callService.startProcess();
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EMPLOYEE,
    UserRole.SUPERADMIN,
  )
  @ApiOperation({ summary: 'Get all calls with filters' })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: "Ixtiyoriy: Filial ID si bo'yicha filter",
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: "Ixtiyoriy: Bo'lim ID si bo'yicha filter",
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: "Ixtiyoriy: Xodim ID si bo'yicha filter",
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      "Ixtiyoriy: Qo'ng'iroq holati bo'yicha filter (UPLOADED, PROCESSING, DONE, ERROR)",
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description:
      'Ixtiyoriy: Boshlanish sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description:
      'Ixtiyoriy: Tugash sanasi (YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  findAll(
    @OrganizationId() organizationId: number,
    @Query('branchId') branchId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.callService.findAll(organizationId, {
      branchId,
      departmentId,
      employeeId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EMPLOYEE,
    UserRole.SUPERADMIN,
  )
  @ApiOperation({ summary: 'Get call by ID with full details' })
  findOne(@OrganizationId() organizationId: number, @Param('id') id: string) {
    return this.callService.findOne(organizationId, id);
  }

  @Get(':id/transcript')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EMPLOYEE,
    UserRole.SUPERADMIN,
  )
  @ApiOperation({ summary: 'Get call transcript segments' })
  getTranscript(@Param('id') id: string) {
    return this.callService.getTranscript(id);
  }

  @Public()
  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get call session status by session ID',
    description: `
      Bu endpoint orqali call session ning to'liq statusini olish mumkin.

      Response ma'lumotlari:
      - status: PENDING, RUNNING, COMPLETED, FAILED
      - progressPercentage: Jarayonning foizi (0-100%)
      - durationSeconds: Davomiyligi sekundlarda
      - statusDescription: O'zbekcha status tavsifi
      - totalNumbers, processedNumbers, connectedCalls, failedCalls: Statistika

      Real-time monitoring uchun har 3-5 sekundda polling qilish tavsiya etiladi.
    `,
  })
  getSessionStatus(@Param('sessionId') sessionId: string) {
    return this.callService.getSessionStatus(sessionId);
  }

  @Public()
  @Get('sessions/all')
  @ApiOperation({
    summary: 'Get all call sessions',
    description: `
      Barcha call sessionslar ro'yxatini olish.

      Har bir session uchun quyidagilar ko'rsatiladi:
      - Session ID va status
      - Progress foizi va davomiyligi
      - Statistika (total, processed, connected, failed)
      - Status tavsifi (o'zbekcha)

      Sessions eng yangilaridan eskilariga qarab tartiblangan.
    `,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of sessions returned (default: 50)',
  })
  getAllSessions(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.callService.getAllSessions(limitNum);
  }
}
