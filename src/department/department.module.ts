import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service.js';
import { DepartmentController } from './department.controller.js';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
