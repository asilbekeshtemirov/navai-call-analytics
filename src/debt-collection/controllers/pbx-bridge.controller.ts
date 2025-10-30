import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LiveKitIntegrationService } from '../services/livekit-integration.service.js';

@Controller('pbx-bridge')
export class PBXBridgeController {
  private readonly logger = new Logger(PBXBridgeController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly livekitService: LiveKitIntegrationService,
  ) {}

  /**
   * Endpoint for Asterisk to lookup room name by PBX user
   * Called when Asterisk receives an incoming call from PBX
   *
   * When PBX makecall API is called with user="admin",
   * Asterisk will receive a call with CALLERID(num)="admin"
   * This endpoint helps Asterisk find which LiveKit room to route to
   */
  @Post('lookup-room')
  async lookupRoomByUser(@Body() data: { user?: string }) {
    // Log the raw request for debugging
    this.logger.log(`🔍 Room lookup request received`);
    this.logger.log(`📦 Request body: ${JSON.stringify(data)}`);

    if (!data || !data.user) {
      this.logger.error(`❌ Invalid request: missing user parameter`);
      return {
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Missing user parameter in request body'
      };
    }

    this.logger.log(`🔍 Looking up room for user: ${data.user}`);

    try {
      // Find the most recent CALLING assignment
      // This assumes sequential calling - one active call at a time per user
      const assignment = await this.prisma.debtCampaignDebtor.findFirst({
        where: {
          callStatus: 'CALLING',
          liveKitRoomName: { not: null },
        },
        orderBy: { lastCallAt: 'desc' },
        include: {
          debtor: true,
        },
      });

      if (!assignment) {
        this.logger.warn(`❌ No active room found for user: ${data.user}`);
        return {
          success: false,
          error: 'NO_ACTIVE_ROOM',
          message: `No active call found for user ${data.user}`
        };
      }

      this.logger.log(
        `✅ Found room: ${assignment.liveKitRoomName} for debtor: ${assignment.debtor.firstName} ${assignment.debtor.lastName} (${assignment.debtor.phone})`
      );

      // Generate fresh SIP token for this call
      if (!assignment.liveKitRoomName) {
        this.logger.error(`❌ No LiveKit room name found for assignment ${assignment.id}`);
        return {
          success: false,
          error: 'NO_ROOM_NAME',
          message: 'Assignment has no LiveKit room name',
        };
      }

      const phoneDigits = assignment.debtor.phone.replace(/\D/g, '');
      const participantIdentity = `debtor-${phoneDigits}`;

      this.logger.log(`🔑 Generating SIP token for ${participantIdentity}`);
      const sipToken = await this.livekitService.generateSipParticipantToken(
        assignment.liveKitRoomName,
        participantIdentity,
        assignment.debtor.phone,
      );
      this.logger.log(`✅ SIP token generated, length: ${sipToken.length}`);

      return {
        success: true,
        roomName: assignment.liveKitRoomName,
        sipToken: sipToken,  // NEW: Return token to Asterisk for authentication
        debtorPhone: assignment.debtor.phone,
        debtorId: assignment.debtorId,
        debtorName: `${assignment.debtor.firstName} ${assignment.debtor.lastName}`,
        assignmentId: assignment.id,
      };

    } catch (error) {
      this.logger.error(`❌ Error looking up room: ${error.message}`);
      this.logger.error(error.stack);

      return {
        success: false,
        error: 'LOOKUP_ERROR',
        message: error.message,
      };
    }
  }
}
