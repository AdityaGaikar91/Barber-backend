<<<<<<< HEAD
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
=======
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
>>>>>>> development

@Injectable()
export class CustomersService {
  async findOrCreate(tenantId: string, phone: string, name: string) {
    if (!phone) {
<<<<<<< HEAD
      throw new BadRequestException('Phone number is required to track customers.');
=======
      throw new BadRequestException(
        'Phone number is required to track customers.',
      );
>>>>>>> development
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
<<<<<<< HEAD
      
    return newCustomer;
  }
  async create(tenantId: string, data: any) {
=======

    return newCustomer;
  }
  async create(tenantId: string, data: CreateCustomerDto) {
>>>>>>> development
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

<<<<<<< HEAD
  async findAll(tenantId: string) {
=======
  async findAll(tenantId: string, limit = 100, offset = 0) {
>>>>>>> development
    return db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, tenantId))
<<<<<<< HEAD
      .orderBy(customers.createdAt);
=======
      .orderBy(customers.createdAt)
      .limit(limit)
      .offset(offset);
>>>>>>> development
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

<<<<<<< HEAD
  async update(tenantId: string, id: string, data: any) {
=======
  async update(tenantId: string, id: string, data: UpdateCustomerDto) {
>>>>>>> development
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
