import { Injectable, Logger } from '@nestjs/common';
import { SipregsErrorDto } from './dto/sipregs-error.dto.js';

@Injectable()
export class SipService {
  private readonly logger = new Logger(SipService.name);

  handleSipregsError(sipregsErrorDto: SipregsErrorDto) {
    this.logger.log('Received sipregs_error webhook:');
    this.logger.log(JSON.stringify(sipregsErrorDto, null, 2));
    // TODO: Add business logic here to process the sip registration error.
    // For example, save to database, notify administrators, etc.
  }
}
