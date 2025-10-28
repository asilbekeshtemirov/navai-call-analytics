import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { LiveKitIntegrationService } from '../services/livekit-integration.service.js';

@ApiTags('Debt Collection - Inbound Calls')
@Controller('debt-collection/inbound')
@Public()
export class InboundWebhookController {
  private readonly logger = new Logger(InboundWebhookController.name);

  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly livekitService: LiveKitIntegrationService,
  ) {}

  @Post('call-started')
  @ApiOperation({ summary: 'Webhook called when inbound call starts (from PBX or LiveKit SIP)' })
  async handleInboundCallStarted(
    @Body()
    data: {
      phone: string;
      roomName: string;
      callId?: string;
    },
  ) {
    try {
      this.logger.log(
        `Inbound call started from ${data.phone} to room ${data.roomName}`,
      );

      // Remove all non-digit characters
      const phoneDigits = data.phone.replace(/\D/g, '');

      // Find debtor by phone
      const context =
        await this.contextBuilder.getContextByPhoneNumber(phoneDigits);

      if (!context) {
        this.logger.warn(`No debtor found for phone: ${phoneDigits}`);
        return {
          success: false,
          message: 'Qarzdor topilmadi',
        };
      }

      // Update LiveKit room with metadata
      try {
        // First send the phone number as a data message
        try {
          const phoneData = {
            type: 'phone-number',
            phone: phoneDigits,
            timestamp: new Date().toISOString()
          };
          
          this.logger.log(`Sending phone number data to room ${data.roomName}:`, JSON.stringify(phoneData, null, 2));
          
          await this.livekitService.sendDataToRoom(data.roomName, phoneData);
          this.logger.log(`Successfully sent phone number ${phoneDigits} to room ${data.roomName}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to send phone number to room: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
          // Continue even if sending data fails
        }
        
        // Then update room metadata
        await this.livekitService.updateRoomMetadata(
          data.roomName,
          JSON.stringify({
            ...context,
            phoneNumber: phoneDigits,
            updatedAt: new Date().toISOString()
          }),
        );
        this.logger.log(
          `Room ${data.roomName} updated with debt context for ${context.debtor.firstName} ${context.debtor.lastName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update room metadata: ${error.message}`,
        );
      }

      return {
        success: true,
        message: 'Context created and room updated',
        debtor: {
          id: context.debtor.id,
          name: `${context.debtor.firstName} ${context.debtor.lastName}`,
        },
        debt: {
          amount: context.debt.amount,
          currency: context.debt.currency,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling inbound call: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
