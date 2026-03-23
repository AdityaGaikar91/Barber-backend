import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Public Endpoint: Fetch booking info for a specific barbershop
  @Get('public/:slug')
  getPublicBookingInfo(@Param('slug') slug: string) {
    return this.appointmentsService.getPublicBookingInfo(slug);
  }

  // Public Endpoint: Submit a new booking request
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('public')
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  // Protected Endpoint: Get appointments for the logged-in employee only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @Get('me')
  getEmployeeAppointments(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getEmployeeAppointments(
      req.user.tenantId!,
      req.user.userId,
      startDate,
      endDate,
    );
  }

  // Protected Endpoint: Get appointments for the logged-in owner's tenant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Get()
  getAppointments(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getTenantAppointments(
      req.user.tenantId!,
      startDate,
      endDate,
    );
  }

  // Protected Endpoint: Update status (Approve, Complete, Cancel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Patch(':id/status')
  updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      req.user.tenantId!,
      id,
      dto.status,
    );
  }
}
