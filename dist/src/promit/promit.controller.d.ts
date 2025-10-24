import { PromitService } from './promit.service.js';
import { CreatePromitDto } from './dto/create-promit.dto.js';
import { UpdatePromitDto } from './dto/update-promit.dto.js';
export declare class PromitController {
    private readonly promitService;
    constructor(promitService: PromitService);
    create(createPromitDto: CreatePromitDto): Promise<{
        message: string;
        data: {
            id: string;
            content: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(): Promise<{
        id: string;
        content: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        content: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updatePromitDto: UpdatePromitDto): Promise<{
        message: string;
        data: {
            id: string;
            content: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
