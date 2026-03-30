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
<<<<<<< HEAD
=======
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
>>>>>>> development

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Roles('OWNER')
  @Post()
<<<<<<< HEAD
  create(@Request() req: any, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(req.user.tenantId, createOfferDto);
=======
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return this.offersService.create(req.user.tenantId!, createOfferDto);
>>>>>>> development
  }

  @Roles('OWNER', 'EMPLOYEE', 'CUSTOMER')
  @Get()
<<<<<<< HEAD
  findAll(@Request() req: any) {
    return this.offersService.findAll(req.user.tenantId);
=======
  findAll(@Request() req: AuthenticatedRequest) {
    return this.offersService.findAll(req.user.tenantId!);
>>>>>>> development
  }

  @Roles('OWNER')
  @Get(':id')
<<<<<<< HEAD
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.offersService.findOne(req.user.tenantId, id);
=======
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.offersService.findOne(req.user.tenantId!, id);
>>>>>>> development
  }

  @Roles('OWNER')
  @Patch(':id')
  update(
<<<<<<< HEAD
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(req.user.tenantId, id, updateOfferDto);
=======
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(req.user.tenantId!, id, updateOfferDto);
>>>>>>> development
  }

  @Roles('OWNER')
  @Delete(':id')
<<<<<<< HEAD
  remove(@Request() req: any, @Param('id') id: string) {
    return this.offersService.remove(req.user.tenantId, id);
=======
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.offersService.remove(req.user.tenantId!, id);
>>>>>>> development
  }
}
