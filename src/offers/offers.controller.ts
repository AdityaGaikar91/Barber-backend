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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Roles('OWNER')
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return this.offersService.create(req.user.tenantId!, createOfferDto);
  }

  @Roles('OWNER', 'EMPLOYEE', 'CUSTOMER')
  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.offersService.findAll(req.user.tenantId!);
  }

  @Roles('OWNER')
  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.offersService.findOne(req.user.tenantId!, id);
  }

  @Roles('OWNER')
  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(req.user.tenantId!, id, updateOfferDto);
  }

  @Roles('OWNER')
  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.offersService.remove(req.user.tenantId!, id);
  }
}
