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
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('OWNER', 'EMPLOYEE') // Both Owners and Employees can create/view customers
  @Post()
  create(@Request() req: any, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(req.user.tenantId, createCustomerDto);
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Post('find-or-create')
  findOrCreate(@Request() req: any, @Body() body: { phone: string; name: string }) {
    return this.customersService.findOrCreate(req.user.tenantId, body.phone, body.name);
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Get()
  findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.tenantId);
  }

  @Roles('OWNER', 'EMPLOYEE')
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.customersService.findOne(req.user.tenantId, id);
  }

  @Roles('OWNER')
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
      req.user.tenantId,
      id,
      updateCustomerDto,
    );
  }

  @Roles('OWNER')
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.customersService.remove(req.user.tenantId, id);
  }
}
