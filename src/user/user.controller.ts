import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UnifiedUserStatisticsDto } from './dto/unified-user-statistics.dto.js';
import { OrganizationId } from '../auth/organization-id.decorator.js';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards to the entire controller
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(
    @OrganizationId() organizationId: number,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.create(organizationId, createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  @ApiOperation({ summary: "O'z organizatsiyasidagi barcha userlarni ko'rish (SUPERADMIN barcha organizatsiyalarni ko'radi, ADMIN/MANAGER SUPERADMIN'ni ko'rmaydi)" })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  findAll(
    @Request() req: any,
    @OrganizationId() organizationId: number,
    @Query('branchId') branchId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    // SUPERADMIN barcha organizatsiyadagi userlarni ko'rishi mumkin
    const filterOrgId = req.user.role === UserRole.SUPERADMIN ? undefined : organizationId;

    // ADMIN va MANAGER SUPERADMIN'ni ko'rmasligi kerak
    const excludeSuperAdmin = req.user.role !== UserRole.SUPERADMIN;

    return this.userService.findAll(filterOrgId, { branchId, departmentId, excludeSuperAdmin });
  }

  @Get(':id/statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  @ApiOperation({
    summary:
      'Birlashtirilgan user statistika - barcha statistika turlarini bir joyda olish',
    description:
      "Bu endpoint orqali daily, monthly, summary ma'lumotlarini sana oralig'i bilan filter qilish mumkin",
  })
  async getUnifiedUserStatistics(
    @Param('id') id: string,
    @Query() filters: UnifiedUserStatisticsDto,
  ) {
    return this.userService.getUnifiedUserStatistics(id, filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // Only ADMIN & SUPERADMIN can update users
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // Only ADMIN & SUPERADMIN can delete users
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // Only ADMIN & SUPERADMIN can update user roles
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(id, updateUserRoleDto.role);
  }
}
