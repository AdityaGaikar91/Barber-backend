import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantSettingsDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Roles('OWNER')
  @Get('settings')
  getSettings(@Request() req: AuthenticatedRequest) {
    return this.tenantsService.getSettings(req.user.tenantId!);
  }

  @Roles('OWNER')
  @Patch('settings')
  async updateSettings(
    @Request() req: AuthenticatedRequest,
    @Body() updateTenantDto: UpdateTenantSettingsDto,
  ) {
    try {
      return await this.tenantsService.updateSettings(
        req.user.tenantId!,
        updateTenantDto,
      );
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(e.message || 'Failed to update settings');
    }
  }
}
