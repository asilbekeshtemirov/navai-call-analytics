import { Controller, Post, Body, Logger, Headers } from '@nestjs/common';
import { PbxService } from './pbx.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('pbx')
@Controller('pbx')
export class PbxController {
  private readonly logger = new Logger(PbxController.name);

  constructor(private readonly pbxService: PbxService) {}

  @Post('history')
  @ApiOperation({ summary: 'PBX history webhook - qo\'ng\'iroq tugagandan keyin' })
  async handleHistory(@Body() data: any, @Headers() headers: any) {
    this.logger.log('History webhook received:', JSON.stringify(data));
    
    // CRM token tekshirish
    if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
      this.logger.warn('Invalid CRM token');
      return { status: 'error', message: 'Invalid token' };
    }

    return this.pbxService.handleHistory(data);
  }

  @Post('event')
  @ApiOperation({ summary: 'PBX event webhook - qo\'ng\'iroq jarayoni' })
  async handleEvent(@Body() data: any, @Headers() headers: any) {
    this.logger.log('Event webhook received:', JSON.stringify(data));
    
    if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
      this.logger.warn('Invalid CRM token');
      return { status: 'error', message: 'Invalid token' };
    }

    return this.pbxService.handleEvent(data);
  }

  @Post('contact')
  @ApiOperation({ summary: 'PBX contact webhook - mijoz ma\'lumotlarini so\'rash' })
  async handleContact(@Body() data: any, @Headers() headers: any) {
    this.logger.log('Contact webhook received:', JSON.stringify(data));
    
    if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
      this.logger.warn('Invalid CRM token');
      return { status: 'error', message: 'Invalid token' };
    }

    return this.pbxService.handleContact(data);
  }

  @Post('rating')
  @ApiOperation({ summary: 'PBX rating webhook - mijoz bahosi' })
  async handleRating(@Body() data: any, @Headers() headers: any) {
    this.logger.log('Rating webhook received:', JSON.stringify(data));
    
    if (data.crm_token !== process.env.PBX_CRM_TOKEN) {
      this.logger.warn('Invalid CRM token');
      return { status: 'error', message: 'Invalid token' };
    }

    return this.pbxService.handleRating(data);
  }
}
