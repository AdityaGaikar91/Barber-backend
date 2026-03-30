import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardMetrics(
    @Request() req: AuthenticatedRequest,
    @Query('tenantId') queryTenantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.analyticsService.getDashboardMetrics(
      tenantId as string,
      startDate,
      endDate,
    );
  }

  @Get('activity')
  getRecentActivity(
    @Request() req: AuthenticatedRequest,
    @Query('tenantId') queryTenantId?: string,
    @Query('limit') limit?: string,
<<<<<<< HEAD
=======
    @Query('page') page?: string,
>>>>>>> development
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.analyticsService.getRecentActivity(
      tenantId as string,
<<<<<<< HEAD
      limit ? parseInt(limit, 10) : 20,
=======
      limit ? parseInt(limit, 10) : 10,
      page ? parseInt(page, 10) : 1,
>>>>>>> development
    );
  }
}
