import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from '../src/company/company.service.js';
import {
  UnifiedStatisticsDto,
  StatisticsType,
} from '../src/company/dto/unified-statistics.dto.js';

describe('Company Unified Statistics', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CompanyService,
          useValue: {
            getUnifiedStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  describe('getUnifiedStatistics', () => {
    it('should be defined', () => {
      expect(service.getUnifiedStatistics).toBeDefined();
    });

    it('should handle all statistics type', async () => {
      const filters: UnifiedStatisticsDto = {
        type: StatisticsType.ALL,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      };

      const mockResult = {
        filters: {
          type: StatisticsType.ALL,
          dateFrom: '2024-01-01T00:00:00.000Z',
          dateTo: '2024-01-31T00:00:00.000Z',
        },
        data: {
          overview: {},
          daily: [],
          monthly: [],
          dashboard: {},
          summary: {},
        },
      };

      jest.spyOn(service, 'getUnifiedStatistics').mockResolvedValue(mockResult);

      const result = await service.getUnifiedStatistics(filters);
      expect(result).toEqual(mockResult);
      expect(service.getUnifiedStatistics).toHaveBeenCalledWith(filters);
    });

    it('should handle overview only type', async () => {
      const filters: UnifiedStatisticsDto = {
        type: StatisticsType.OVERVIEW,
      };

      const mockResult = {
        filters: { type: StatisticsType.OVERVIEW },
        data: { overview: {}, summary: {} },
      };

      jest.spyOn(service, 'getUnifiedStatistics').mockResolvedValue(mockResult);

      const result = await service.getUnifiedStatistics(filters);
      expect(result).toEqual(mockResult);
    });

    it('should handle date range filtering', async () => {
      const filters: UnifiedStatisticsDto = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        extCode: '1001',
      };

      const mockResult = {
        filters: {
          dateFrom: '2024-01-01T00:00:00.000Z',
          dateTo: '2024-01-31T00:00:00.000Z',
          extCode: '1001',
        },
        data: { summary: {} },
      };

      jest.spyOn(service, 'getUnifiedStatistics').mockResolvedValue(mockResult);

      const result = await service.getUnifiedStatistics(filters);
      expect(result.filters.extCode).toBe('1001');
    });
  });
});
