import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('tenants')
  listAllTenants() {
    return this.adminService.listAllTenants();
  }

  @Get('tenants/:id')
  getTenantDetail(@Param('id') id: string) {
    return this.adminService.getTenantDetail(id);
  }

  @Patch('tenants/:id/subscription')
  updateTenantSubscription(
    @Param('id') id: string,
    @Body() body: { tier: 'FREE' | 'PRO' | 'ENTERPRISE' },
  ) {
    return this.adminService.updateTenantSubscription(id, body.tier);
  }
}
