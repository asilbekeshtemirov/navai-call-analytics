import { CreateContactDto } from './create-contact.dto.js';
import { ContactStatus } from '@prisma/client';
declare const UpdateContactDto_base: import("@nestjs/common").Type<Partial<CreateContactDto>>;
export declare class UpdateContactDto extends UpdateContactDto_base {
    status?: ContactStatus;
    lastConversationOutcome?: string;
    currentConversationOutcome?: string;
}
export {};
