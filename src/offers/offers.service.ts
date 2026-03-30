import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { offers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
<<<<<<< HEAD
=======
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
>>>>>>> development
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class OffersService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

<<<<<<< HEAD
  async create(tenantId: string, data: any) {
=======
  async create(tenantId: string, data: CreateOfferDto) {
>>>>>>> development
    const isPro = await this.subscriptionsService.isPro(tenantId);
    if (!isPro) {
      throw new ForbiddenException(
        'Campaigns are only available on PRO or ENTERPRISE plans. Please upgrade.',
      );
    }

    const [newOffer] = await db
      .insert(offers)
      .values({
        tenantId,
        title: data.title,
        discountPercentage: data.discountPercentage,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();
    return newOffer;
  }

  async findAll(tenantId: string) {
    return db
      .select()
      .from(offers)
      .where(eq(offers.tenantId, tenantId))
      .orderBy(offers.createdAt);
  }

  async findOne(tenantId: string, id: string) {
    const [offer] = await db
      .select()
      .from(offers)
      .where(and(eq(offers.id, id), eq(offers.tenantId, tenantId)));

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

<<<<<<< HEAD
  async update(tenantId: string, id: string, data: any) {
    const updateData: any = { updatedAt: new Date() };
=======
  async update(tenantId: string, id: string, data: UpdateOfferDto) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
>>>>>>> development
    if (data.title !== undefined) updateData.title = data.title;
    if (data.discountPercentage !== undefined)
      updateData.discountPercentage = data.discountPercentage;
    if (data.validFrom !== undefined)
      updateData.validFrom = new Date(data.validFrom);
    if (data.validUntil !== undefined)
      updateData.validUntil = new Date(data.validUntil);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedOffer] = await db
      .update(offers)
      .set(updateData)
      .where(and(eq(offers.id, id), eq(offers.tenantId, tenantId)))
      .returning();

    if (!updatedOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return updatedOffer;
  }

  async remove(tenantId: string, id: string) {
    const [deletedOffer] = await db
      .delete(offers)
      .where(and(eq(offers.id, id), eq(offers.tenantId, tenantId)))
      .returning();

    if (!deletedOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return deletedOffer;
  }
}
