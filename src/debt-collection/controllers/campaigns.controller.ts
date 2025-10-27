import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { OrganizationId } from '../../auth/organization-id.decorator.js';
import { CampaignService } from '../services/campaign.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { CreateCampaignDto } from '../dto/create-campaign.dto.js';
import { UserRole } from '@prisma/client';

@ApiTags('Debt Collection - Campaigns')
@Controller('debt-collection/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CampaignsController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly orchestratorService: CampaignOrchestratorService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new campaign' })
  create(
    @OrganizationId() organizationId: number,
    @Body() createCampaignDto: CreateCampaignDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    return this.campaignService.create(organizationId, createCampaignDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all campaigns' })
  findAll(@OrganizationId() organizationId: number) {
    return this.campaignService.findAll(organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get campaign by ID' })
  findOne(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    return this.campaignService.findOne(id, organizationId);
  }

  @Get(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get campaign progress' })
  getProgress(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    return this.campaignService.getProgress(id, organizationId);
  }

  @Post(':id/start')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Start campaign' })
  async start(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    await this.orchestratorService.startCampaign(id, organizationId);
    return { message: 'Kampaniya boshlandi' };
  }

  @Post(':id/pause')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Pause campaign' })
  async pause(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    await this.orchestratorService.pauseCampaign(id, organizationId);
    return { message: 'Kampaniya to\'xtatildi' };
  }

  @Post(':id/resume')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Resume campaign' })
  async resume(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    await this.orchestratorService.resumeCampaign(id, organizationId);
    return { message: 'Kampaniya davom ettirildi' };
  }

  @Post(':id/stop')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Stop campaign' })
  async stop(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    await this.orchestratorService.stopCampaign(id, organizationId);
    return { message: 'Kampaniya to\'xtatildi' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete campaign' })
  remove(
    @Param('id') id: string,
    @OrganizationId() organizationId: number,
  ) {
    return this.campaignService.delete(id, organizationId);
  }
}
