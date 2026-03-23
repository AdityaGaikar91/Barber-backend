import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CustomersService {
  async findOrCreate(tenantId: string, phone: string, name: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required to track customers.');
    }
    const [existing] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.phone, phone)));

    if (existing) {
      // Opt: We could update the name here to be fresh, but returning what we have is standard.
      return existing;
    }

    const [newCustomer] = await db
      .insert(customers)
      .values({
        tenantId,
        name,
        phone,
      })
      .returning();
      
    return newCustomer;
  }
  async create(tenantId: string, data: any) {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .returning();
    return newCustomer;
  }

  async findAll(tenantId: string) {
    return db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, tenantId))
      .orderBy(customers.createdAt);
  }

  async findOne(tenantId: string, id: string) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(tenantId: string, id: string, data: any) {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        name: data.name,
        email: data.email,
        phone: data.phone,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .returning();

    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return updatedCustomer;
  }

  async remove(tenantId: string, id: string) {
    const [deletedCustomer] = await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .returning();

    if (!deletedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return deletedCustomer;
  }
}
