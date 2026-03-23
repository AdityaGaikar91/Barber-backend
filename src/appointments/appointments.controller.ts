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
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Public Endpoint: Fetch booking info for a specific barbershop
  @Get('public/:slug')
  getPublicBookingInfo(@Param('slug') slug: string) {
    return this.appointmentsService.getPublicBookingInfo(slug);
  }

  // Public Endpoint: Submit a new booking request
  @Post('public')
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  // Protected Endpoint: Get appointments for the logged-in owner's tenant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Get()
  getAppointments(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getTenantAppointments(
      req.user.tenantId,
      startDate,
      endDate,
    );
  }

  // Protected Endpoint: Update status (Approve, Complete, Cancel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      req.user.tenantId,
      id,
      dto.status,
    );
  }
}
