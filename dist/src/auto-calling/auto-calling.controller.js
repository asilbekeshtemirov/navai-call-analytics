var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody, } from '@nestjs/swagger';
import { AutoCallingService } from './auto-calling.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ContactStatus, CampaignStatus } from '@prisma/client';
let AutoCallingController = class AutoCallingController {
    autoCallingService;
    constructor(autoCallingService) {
        this.autoCallingService = autoCallingService;
    }
    createContact(req, createContactDto) {
        return this.autoCallingService.createContact(req.user.organizationId, createContactDto);
    }
    findAllContacts(req, page, limit, status) {
        return this.autoCallingService.findAllContacts(req.user.organizationId, page, limit, status);
    }
    findContactById(req, id) {
        return this.autoCallingService.findContactById(req.user.organizationId, id);
    }
    updateContact(req, id, updateContactDto) {
        return this.autoCallingService.updateContact(req.user.organizationId, id, updateContactDto);
    }
    deleteContact(req, id) {
        return this.autoCallingService.deleteContact(req.user.organizationId, id);
    }
    async uploadExcel(req, file) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        if (!file.originalname.endsWith('.xlsx') &&
            !file.originalname.endsWith('.xls')) {
            throw new BadRequestException('Only Excel files are allowed');
        }
        return this.autoCallingService.parseExcelAndCreateContacts(req.user.organizationId, file);
    }
    createCampaign(req, createCampaignDto) {
        return this.autoCallingService.createCampaign(req.user.organizationId, createCampaignDto);
    }
    findAllCampaigns(req, page, limit, status) {
        return this.autoCallingService.findAllCampaigns(req.user.organizationId, page, limit, status);
    }
    getCampaignById(req, id) {
        return this.autoCallingService.getCampaignById(req.user.organizationId, id);
    }
    addContactsToCampaign(req, id, contactIds) {
        return this.autoCallingService.addContactsToCampaign(req.user.organizationId, id, contactIds);
    }
    deleteCampaign(req, id) {
        return this.autoCallingService.deleteCampaign(req.user.organizationId, id);
    }
    startCampaign(req, id) {
        return this.autoCallingService.startCampaign(req.user.organizationId, id);
    }
    stopCampaign(req, id) {
        return this.autoCallingService.stopCampaign(req.user.organizationId, id);
    }
};
__decorate([
    Post('contacts'),
    ApiOperation({ summary: 'Create a new contact' }),
    ApiResponse({ status: 201, description: 'Contact created successfully' }),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateContactDto]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "createContact", null);
__decorate([
    Get('contacts'),
    ApiOperation({ summary: 'Get all contacts with pagination' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 50 }),
    ApiQuery({ name: 'status', required: false, enum: ContactStatus }),
    __param(0, Request()),
    __param(1, Query('page', new ParseIntPipe({ optional: true }))),
    __param(2, Query('limit', new ParseIntPipe({ optional: true }))),
    __param(3, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "findAllContacts", null);
__decorate([
    Get('contacts/:id'),
    ApiOperation({ summary: 'Get contact by ID' }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "findContactById", null);
__decorate([
    Patch('contacts/:id'),
    ApiOperation({ summary: 'Update contact' }),
    __param(0, Request()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateContactDto]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "updateContact", null);
__decorate([
    Delete('contacts/:id'),
    ApiOperation({ summary: 'Delete contact' }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "deleteContact", null);
__decorate([
    Post('contacts/upload-excel'),
    ApiOperation({ summary: 'Upload Excel file to create multiple contacts' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    UseInterceptors(FileInterceptor('file')),
    __param(0, Request()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AutoCallingController.prototype, "uploadExcel", null);
__decorate([
    Post('campaigns'),
    ApiOperation({ summary: 'Create a new campaign' }),
    ApiResponse({ status: 201, description: 'Campaign created successfully' }),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCampaignDto]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "createCampaign", null);
__decorate([
    Get('campaigns'),
    ApiOperation({ summary: 'Get all campaigns with pagination' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiQuery({ name: 'status', required: false, enum: CampaignStatus }),
    __param(0, Request()),
    __param(1, Query('page', new ParseIntPipe({ optional: true }))),
    __param(2, Query('limit', new ParseIntPipe({ optional: true }))),
    __param(3, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "findAllCampaigns", null);
__decorate([
    Get('campaigns/:id'),
    ApiOperation({ summary: 'Get campaign by ID' }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "getCampaignById", null);
__decorate([
    Post('campaigns/:id/contacts'),
    ApiOperation({ summary: 'Add contacts to campaign' }),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                contactIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['uuid-1', 'uuid-2'],
                },
            },
        },
    }),
    __param(0, Request()),
    __param(1, Param('id')),
    __param(2, Body('contactIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "addContactsToCampaign", null);
__decorate([
    Delete('campaigns/:id'),
    ApiOperation({ summary: 'Delete campaign' }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "deleteCampaign", null);
__decorate([
    Post('campaigns/:id/start'),
    ApiOperation({ summary: 'Start auto-calling campaign' }),
    ApiResponse({
        status: 200,
        description: 'Campaign started successfully',
    }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "startCampaign", null);
__decorate([
    Post('campaigns/:id/stop'),
    ApiOperation({ summary: 'Stop running campaign' }),
    ApiResponse({
        status: 200,
        description: 'Campaign stopped successfully',
    }),
    __param(0, Request()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoCallingController.prototype, "stopCampaign", null);
AutoCallingController = __decorate([
    ApiTags('Auto-Calling'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('auto-calling'),
    __metadata("design:paramtypes", [AutoCallingService])
], AutoCallingController);
export { AutoCallingController };
//# sourceMappingURL=auto-calling.controller.js.map