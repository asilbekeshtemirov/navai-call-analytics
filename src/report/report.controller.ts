import { Controller, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  create(@Body() generateReportDto: GenerateReportDto) {
    return this.reportService.generate(generateReportDto);
  }
}
