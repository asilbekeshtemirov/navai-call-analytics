import { DownloaderService } from './downloader.service.js';
export declare class DownloaderController {
    private readonly downloaderService;
    constructor(downloaderService: DownloaderService);
    triggerDownload(): Promise<{
        message: string;
    }>;
}
