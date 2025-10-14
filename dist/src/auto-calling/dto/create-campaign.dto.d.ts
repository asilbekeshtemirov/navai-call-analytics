import { CampaignType } from '@prisma/client';
export declare class CreateCampaignDto {
    name: string;
    description?: string;
    campaignType: CampaignType;
    contactIds?: string[];
}
