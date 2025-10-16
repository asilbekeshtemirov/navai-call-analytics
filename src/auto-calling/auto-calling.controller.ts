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
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AutoCallingService } from './auto-calling.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ContactStatus, CampaignStatus } from '@prisma/client';

@ApiTags('Auto-Calling')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('auto-calling')
export class AutoCallingController {
  constructor(private readonly autoCallingService: AutoCallingService) {}

  // ========== CONTACTS ENDPOINTS ==========
  @Post('contacts')
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  createContact(@Request() req: any, @Body() createContactDto: CreateContactDto) {
    return this.autoCallingService.createContact(
      req.user.organizationId,
      createContactDto,
    );
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get all contacts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ContactStatus })
  findAllContacts(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: ContactStatus,
  ) {
    return this.autoCallingService.findAllContacts(
      req.user.organizationId,
      page,
      limit,
      status,
    );
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact by ID' })
  async findContactById(@Request() req: any, @Param('id') id: string) {
    const contact = await this.autoCallingService.findContactById(req.user.organizationId, id);
    return { data: contact };
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  updateContact(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.autoCallingService.updateContact(
      req.user.organizationId,
      id,
      updateContactDto,
    );
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  deleteContact(@Request() req: any, @Param('id') id: string) {
    return this.autoCallingService.deleteContact(req.user.organizationId, id);
  }

  // ========== EXCEL UPLOAD ==========
  @Post('contacts/upload-excel')
  @ApiOperation({ summary: 'Upload Excel file to create multiple contacts' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new BadRequestException('Only Excel files are allowed');
    }

    return this.autoCallingService.parseExcelAndCreateContacts(
      req.user.organizationId,
      file,
    );
  }

  // ========== CAMPAIGNS ENDPOINTS ==========
  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  createCampaign(@Request() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    return this.autoCallingService.createCampaign(
      req.user.organizationId,
      createCampaignDto,
    );
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  findAllCampaigns(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: CampaignStatus,
  ) {
    return this.autoCallingService.findAllCampaigns(
      req.user.organizationId,
      page,
      limit,
      status,
    );
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  getCampaignById(@Request() req: any, @Param('id') id: string) {
    return this.autoCallingService.getCampaignById(req.user.organizationId, id);
  }

  @Post('campaigns/:id/contacts')
  @ApiOperation({ summary: 'Add contacts to campaign' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contactIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['uuid-1', 'uuid-2'],
        },
      },
    },
  })
  addContactsToCampaign(
    @Request() req: any,
    @Param('id') id: string,
    @Body('contactIds') contactIds: string[],
  ) {
    return this.autoCallingService.addContactsToCampaign(
      req.user.organizationId,
      id,
      contactIds,
    );
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  deleteCampaign(@Request() req: any, @Param('id') id: string) {
    return this.autoCallingService.deleteCampaign(req.user.organizationId, id);
  }

  // ========== CAMPAIGN CONTROL ==========
  @Post('campaigns/:id/start')
  @ApiOperation({ summary: 'Start auto-calling campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign started successfully',
  })
  startCampaign(@Request() req: any, @Param('id') id: string) {
    return this.autoCallingService.startCampaign(req.user.organizationId, id);
  }

  @Post('campaigns/:id/stop')
  @ApiOperation({ summary: 'Stop running campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign stopped successfully',
  })
  stopCampaign(@Request() req: any, @Param('id') id: string) {
    return this.autoCallingService.stopCampaign(req.user.organizationId, id);
  }

  // ========== TWILIO WEBHOOKS (PUBLIC) ==========
  @Get('twilio/twiml')
  @ApiOperation({ summary: 'Generate TwiML for call' })
  getTwiML(@Query('contactId') contactId: string) {
    return this.autoCallingService.generateTwiMLForContact(contactId);
  }

  @Post('twilio/status')
  @ApiOperation({ summary: 'Twilio call status webhook' })
  handleCallStatus(@Body() body: any) {
    return this.autoCallingService.handleTwilioCallStatus(body);
  }

  @Post('twilio/recording')
  @ApiOperation({ summary: 'Twilio recording webhook' })
  handleRecording(@Body() body: any) {
    return this.autoCallingService.handleTwilioRecording(body);
  }

  @Post('twilio/handle-response')
  @ApiOperation({ summary: 'Handle call response from user' })
  handleResponse(@Body() body: any) {
    return this.autoCallingService.handleUserResponse(body);
  }
}
