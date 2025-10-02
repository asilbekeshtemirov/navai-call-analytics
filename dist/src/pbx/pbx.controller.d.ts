import { PbxService } from './pbx.service.js';
export declare class PbxController {
    private readonly pbxService;
    private readonly logger;
    constructor(pbxService: PbxService);
    handleHistory(data: any, headers: any): Promise<{
        status: string;
        call_id: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
        call_id?: undefined;
    }>;
    handleEvent(data: any, headers: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleContact(data: any, headers: any): Promise<{
        contact_name: string;
        responsible: string;
        status?: undefined;
        message?: undefined;
    } | {
        status: string;
        message: any;
        contact_name?: undefined;
        responsible?: undefined;
    }>;
    handleRating(data: any, headers: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
}
