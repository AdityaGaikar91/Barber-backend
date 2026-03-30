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
<<<<<<< HEAD
=======
import { Throttle } from '@nestjs/throttler';
>>>>>>> development
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
<<<<<<< HEAD
=======
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
>>>>>>> development

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Public Endpoint: Fetch booking info for a specific barbershop
  @Get('public/:slug')
  getPublicBookingInfo(@Param('slug') slug: string) {
    return this.appointmentsService.getPublicBookingInfo(slug);
  }

  // Public Endpoint: Submit a new booking request
<<<<<<< HEAD
=======
  @Throttle({ default: { limit: 10, ttl: 60000 } })
>>>>>>> development
  @Post('public')
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

<<<<<<< HEAD
=======
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

>>>>>>> development
  // Protected Endpoint: Get appointments for the logged-in owner's tenant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Get()
  getAppointments(
<<<<<<< HEAD
    @Request() req: any,
=======
    @Request() req: AuthenticatedRequest,
>>>>>>> development
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getTenantAppointments(
<<<<<<< HEAD
      req.user.tenantId,
=======
      req.user.tenantId!,
>>>>>>> development
      startDate,
      endDate,
    );
  }

  // Protected Endpoint: Update status (Approve, Complete, Cancel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'EMPLOYEE')
  @Patch(':id/status')
  updateStatus(
<<<<<<< HEAD
    @Request() req: any,
=======
    @Request() req: AuthenticatedRequest,
>>>>>>> development
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
<<<<<<< HEAD
      req.user.tenantId,
=======
      req.user.tenantId!,
>>>>>>> development
      id,
      dto.status,
    );
  }
}
