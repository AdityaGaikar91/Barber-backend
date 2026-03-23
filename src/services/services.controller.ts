import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() body: CreateServiceDto) {
    // Ideally user context has tenantId. For MVP we assume single tenant or explicit field
    const tenantId =
      req.user.tenantId || (body as { tenantId?: string }).tenantId;
    return this.servicesService.create(tenantId as string, body);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.servicesService.findAll(tenantId as string);
  }

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.servicesService.findOne(tenantId as string, id);
  }

  @Put(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateServiceDto,
  ) {
    const tenantId =
      req.user.tenantId || (body as { tenantId?: string }).tenantId;
    return this.servicesService.update(tenantId as string, id, body);
  }

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = req.user.tenantId || queryTenantId;
    return this.servicesService.remove(tenantId as string, id);
  }
}
