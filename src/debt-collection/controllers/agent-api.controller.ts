import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { CampaignOrchestratorService } from '../services/campaign-orchestrator.service.js';
import { RecordOutcomeDto } from '../dto/call-outcome.dto.js';

@ApiTags('Debt Collection - Agent API')
@Controller('debt-collection/calls')
@Public() // These endpoints are called by the voice agent
export class AgentApiController {
  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly orchestrator: CampaignOrchestratorService,
  ) {}

  @Get(':roomName/context')
  @ApiOperation({ summary: 'Get call context for voice agent (called by agent)' })
  async getContext(@Param('roomName') roomName: string) {
    const context = await this.contextBuilder.getContextByRoomName(roomName);

    if (!context) {
      throw new NotFoundException('Qo\'ng\'iroq konteksti topilmadi');
    }

    return context;
  }

  @Get('phone/:phone/context')
  @ApiOperation({ summary: 'Get call context by phone number (for inbound calls)' })
  async getContextByPhone(@Param('phone') phone: string) {
    const context = await this.contextBuilder.getContextByPhoneNumber(phone);

    if (!context) {
      throw new NotFoundException('Telefon raqami uchun kontekst topilmadi');
    }

    return context;
  }

  @Post(':roomName/outcome')
  @ApiOperation({ summary: 'Record call outcome (called by agent)' })
  async recordOutcome(
    @Param('roomName') roomName: string,
    @Body() outcomeDto: RecordOutcomeDto,
  ) {
    await this.orchestrator.handleCallCompletion(roomName, outcomeDto);
    return { message: 'Natija saqlandi' };
  }

  @Post(':roomName/promise')
  @ApiOperation({ summary: 'Record payment promise (called by agent)' })
  async recordPromise(
    @Param('roomName') roomName: string,
    @Body() data: { promisedAmount: number; promisedDate: string; notes?: string },
  ) {
    await this.orchestrator.handleCallCompletion(roomName, {
      outcome: 'PROMISE',
      promisedAmount: data.promisedAmount,
      promisedDate: data.promisedDate,
      notes: data.notes,
    });
    return { message: 'To\'lov vadasi saqlandi' };
  }

  @Post(':roomName/dispute')
  @ApiOperation({ summary: 'Record dispute (called by agent)' })
  async recordDispute(
    @Param('roomName') roomName: string,
    @Body() data: { notes: string },
  ) {
    await this.orchestrator.handleCallCompletion(roomName, {
      outcome: 'DISPUTED',
      notes: data.notes,
    });
    return { message: 'Nizo saqlandi' };
  }

  @Post(':roomName/note')
  @ApiOperation({ summary: 'Add call note (called by agent)' })
  async addNote(
    @Param('roomName') roomName: string,
    @Body() data: { note: string },
  ) {
    // This is handled via the outcome endpoint for now
    return { message: 'Eslatma saqlandi' };
  }
}
