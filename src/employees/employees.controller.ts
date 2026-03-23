import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LogTransactionDto } from './dto/log-transaction.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateEmployeeDto,
  ) {
    const tenantId =
      req.user.tenantId || (body as { tenantId?: string }).tenantId;
    return this.employeesService.create(tenantId as string, body);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.employeesService.findAll(tenantId as string);
  }

  // Record a transaction for an employee
  @Post(':id/transactions')
  logTransaction(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: LogTransactionDto,
  ) {
    const tenantId =
      req.user.tenantId || (body as { tenantId?: string }).tenantId;
    return this.employeesService.logServiceTransaction(tenantId as string, {
      ...body,
      employeeId: id,
    });
  }

  // View transactions for an employee
  @Get(':id/transactions')
  getTransactions(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.employeesService.getEmployeeTransactions(
      tenantId as string,
      id,
    );
  }

  // View aggregated metrics for an employee
  @Get(':id/metrics')
  getMetrics(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.employeesService.getEmployeeMetrics(
      tenantId as string,
      id,
      startDate,
      endDate,
    );
  }
}
