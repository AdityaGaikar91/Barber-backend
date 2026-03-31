import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { services } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  async create(tenantId: string, data: CreateServiceDto) {
    const result = await db
      .insert(services)
      .values({
        tenantId,
        ...data,
        price: String(data.price),
      })
      .returning();
    return result[0];
  }

  async findAll(tenantId: string) {
    return db.select().from(services).where(eq(services.tenantId, tenantId));
  }

  async findOne(tenantId: string, id: string) {
    const result = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
      .limit(1);
    if (!result.length) throw new NotFoundException('Service not found');
    return result[0];
  }

  async update(tenantId: string, id: string, data: UpdateServiceDto) {
    const { price, ...rest } = data;
    const result = await db
      .update(services)
      .set({
        ...rest,
        ...(price !== undefined && { price: String(price) }),
        updatedAt: new Date(),
      })
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
      .returning();
    if (!result.length) throw new NotFoundException('Service not found');
    return result[0];
  }

  async remove(tenantId: string, id: string) {
    const result = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
      .returning();
    if (!result.length) throw new NotFoundException('Service not found');
    return { success: true };
  }
}
