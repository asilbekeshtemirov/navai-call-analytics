import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum StatisticsType {
  OVERVIEW = 'overview',
  DAILY = 'daily',
  MONTHLY = 'monthly',
  DASHBOARD = 'dashboard',
  ALL = 'all'
}

export class UnifiedStatisticsDto {
  @ApiPropertyOptional({ 
    description: 'Type of statistics to retrieve',
    enum: StatisticsType,
    default: StatisticsType.ALL
  })
  @IsOptional()
  @IsEnum(StatisticsType)
  type?: StatisticsType = StatisticsType.ALL;

  @ApiPropertyOptional({ 
    description: 'Start date for filtering (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' 
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'End date for filtering (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' 
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by employee extension code' 
  })
  @IsOptional()
  @IsString()
  extCode?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by employee ID' 
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by department ID' 
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by branch ID' 
  })
  @IsOptional()
  @IsString()
  branchId?: string;
}
