export declare class HistoryDto {
    cmd: string;
    type: string;
    status: string;
    phone: string;
    user: string;
    start: string;
    duration: number;
    link: string;
    crm_token: string;
    callid: string;
}
export declare class EventDto {
    cmd: string;
    crm_token: string;
    type: string;
    callid: string;
    phone: string;
    user: string;
    direction: string;
    diversion?: string;
    groupRealName?: string;
    ext?: string;
    telnum?: string;
    telnum_name?: string;
    second_callid?: string;
}
export declare class ContactDto {
    cmd: string;
    crm_token: string;
    phone: string;
    callid: string;
    diversion?: string;
}
export declare class RatingDto {
    cmd: string;
    crm_token: string;
    phone: string;
    callid: string;
    rating: number;
    user: string;
    ext?: string;
}
