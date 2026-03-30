import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
<<<<<<< HEAD
=======
  Query,
>>>>>>> development
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
<<<<<<< HEAD
=======
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
>>>>>>> development

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('OWNER', 'EMPLOYEE') // Both Owners and Employees can create/view customers
  @Post()
<<<<<<< HEAD
  create(@Request() req: any, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(req.user.tenantId, createCustomerDto);
=======
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(req.user.tenantId!, createCustomerDto);
>>>>>>> development
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Post('find-or-create')
<<<<<<< HEAD
  findOrCreate(@Request() req: any, @Body() body: { phone: string; name: string }) {
    return this.customersService.findOrCreate(req.user.tenantId, body.phone, body.name);
=======
  findOrCreate(
    @Request() req: AuthenticatedRequest,
    @Body() body: { phone: string; name: string },
  ) {
    return this.customersService.findOrCreate(
      req.user.tenantId!,
      body.phone,
      body.name,
    );
>>>>>>> development
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Get()
<<<<<<< HEAD
  findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.tenantId);
=======
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.customersService.findAll(
      req.user.tenantId!,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
>>>>>>> development
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Get(':id')
<<<<<<< HEAD
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.customersService.findOne(req.user.tenantId, id);
=======
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.customersService.findOne(req.user.tenantId!, id);
>>>>>>> development
  }

  @Roles('OWNER')
  @Patch(':id')
  update(
<<<<<<< HEAD
    @Request() req: any,
=======
    @Request() req: AuthenticatedRequest,
>>>>>>> development
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
<<<<<<< HEAD
      req.user.tenantId,
=======
      req.user.tenantId!,
>>>>>>> development
      id,
      updateCustomerDto,
    );
  }

  @Roles('OWNER')
  @Delete(':id')
<<<<<<< HEAD
  remove(@Request() req: any, @Param('id') id: string) {
    return this.customersService.remove(req.user.tenantId, id);
=======
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.customersService.remove(req.user.tenantId!, id);
>>>>>>> development
  }
}
