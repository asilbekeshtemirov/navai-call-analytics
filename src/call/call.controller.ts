import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { CallService } from './call.service.js';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { CreateCallDto } from './dto/create-call.dto.js';
import { UploadFromUrlDto } from './dto/upload-from-url.dto.js';
import {
  HistoryDto,
  EventDto,
  ContactDto,
  RatingDto,
} from './dto/vats-webhook.dto.js';

@ApiTags('calls')
@ApiBearerAuth('access-token')
@Controller('calls')
export class CallController {
  private readonly logger = new Logger(CallController.name);
  constructor(private readonly callService: CallService) {}

  @Post('vats')
  @ApiExcludeEndpoint()
  async handleVatsWebhook(
    @Body() body: HistoryDto | EventDto | ContactDto | RatingDto,
  ) {
    this.logger.log(`Received VATS webhook with command: ${body.cmd}`);
    switch (body.cmd) {
      case 'history':
        return this.callService.handleHistory(body as HistoryDto);
      case 'event':
        return this.callService.handleEvent(body as EventDto);
      case 'contact':
        return this.callService.handleContact(body as ContactDto);
      case 'rating':
        return this.callService.handleRating(body as RatingDto);
      default:
        this.logger.warn(`Unknown VATS webhook command: ${body.cmd}`);
        return { status: 'ignored', message: 'Unknown command' };
    }
  }

  @Post('upload-from-url')
  @ApiOperation({ summary: 'Upload call from URL' })
  uploadFromUrl(@Body() uploadFromUrlDto: UploadFromUrlDto) {
    return this.callService.uploadFromUrl(uploadFromUrlDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createCallDto: CreateCallDto) {
    return this.callService.create(createCallDto);
  }

  @Post('manual')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manual qo\'ng\'iroq yaratish (test uchun)' })
  async createManualCall(@Body() data: {
    employeeId: string;
    callerNumber: string;
    calleeNumber: string;
    durationSec: number;
    audioUrl?: string;
  }) {
    return this.callService.createManualCall(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all calls with filters' })
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
  @ApiOperation({ summary: 'Get call by ID with full details' })
  findOne(@Param('id') id: string) {
    return this.callService.findOne(id);
  }

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Get call transcript segments' })
  getTranscript(@Param('id') id: string) {
    return this.callService.getTranscript(id);
  }
}
