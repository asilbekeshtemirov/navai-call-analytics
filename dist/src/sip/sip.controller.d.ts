import { SipService } from './sip.service.js';
import { SipregsErrorDto } from './dto/sipregs-error.dto.js';
export declare class SipController {
    private readonly sipService;
    constructor(sipService: SipService);
    handleSipregsError(sipregsErrorDto: SipregsErrorDto): void;
}
