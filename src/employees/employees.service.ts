import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isDatabaseError } from '../db/database-error.interface';
import { db } from '../db';
import { employees, serviceTransactions, appointments } from '../db/schema';
import { eq, and, desc, sql, or, gte } from 'drizzle-orm';

import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { users } from '../db/schema';

import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LogTransactionDto } from './dto/log-transaction.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private eventEmitter: EventEmitter2,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(tenantId: string, data: CreateEmployeeDto) {
    // Enforce employee limit based on subscription
    await this.subscriptionsService.checkEmployeeAvailability(tenantId);
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    try {
      const newEmployee = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            tenantId,
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword,
            role: 'EMPLOYEE',
          })
          .returning();

        const [employee] = await tx
          .insert(employees)
          .values({
            tenantId,
            userId: newUser.id,
            bio: data.bio,
          })
          .returning();

        return employee;
      });

      return newEmployee;
    } catch (error: unknown) {
      if (isDatabaseError(error) && error.code === '23505') {
        throw new BadRequestException('User with this email already exists.');
      }
      throw new BadRequestException(
        `Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(tenantId: string, limit = 100, offset = 0) {
    // Join with users table to get name and email
    return db
      .select({
        id: employees.id,
        tenantId: employees.tenantId,
        userId: employees.userId,
        bio: employees.bio,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        name: users.name,
        email: users.email,
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.tenantId, tenantId))
      .limit(limit)
      .offset(offset);
  }

  async logServiceTransaction(
    tenantId: string,
    data: LogTransactionDto & { employeeId: string },
  ) {
    // Enforce monthly transaction limit based on subscription
    await this.subscriptionsService.checkTransactionAvailability(tenantId);
    const result = await db
      .insert(serviceTransactions)
      .values({
        tenantId,
        serviceId: data.serviceId,
        employeeId: data.employeeId,
        customerId: data.customerId || null,
        amount: String(data.amount),
        status: 'COMPLETED',
      })
      .returning();

    const newTx = result[0];

    // Auto-complete any open appointments for this customer today
    if (newTx.customerId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        await db
          .update(appointments)
          .set({ status: 'COMPLETED' })
          .where(
            and(
              eq(appointments.tenantId, tenantId),
              eq(appointments.customerId, newTx.customerId),
              gte(appointments.appointmentTime, startOfDay),
              or(
                eq(appointments.status, 'PENDING'),
                eq(appointments.status, 'APPROVED'),
              ),
            ),
          );
      } catch (e) {
        console.error('Failed to auto-complete appointment:', e);
      }
    }

    // Emit event for automated notifications
    this.eventEmitter.emit('transaction.completed', {
      transactionId: newTx.id,
      tenantId: newTx.tenantId,
      customerId: newTx.customerId,
    });

    return newTx;
  }

  async getEmployeeTransactions(tenantId: string, employeeId: string) {
    return db
      .select()
      .from(serviceTransactions)
      .where(
        and(
          eq(serviceTransactions.employeeId, employeeId),
          eq(serviceTransactions.tenantId, tenantId),
        ),
      )
      .orderBy(desc(serviceTransactions.timestamp));
  }

  async getEmployeeMetrics(
    tenantId: string,
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const conditions = [
      eq(serviceTransactions.tenantId, tenantId),
      eq(serviceTransactions.employeeId, employeeId),
    ];

    if (startDate) {
      const startD = new Date(startDate);
      startD.setHours(0, 0, 0, 0);
      conditions.push(
        sql`${serviceTransactions.timestamp} >= ${startD.toISOString()}`,
      );
    }
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      conditions.push(
        sql`${serviceTransactions.timestamp} <= ${endD.toISOString()}`,
      );
    }

    // 1. Total Services and Revenue
    const summaryResult = await db
      .select({
        totalServices: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${serviceTransactions.amount})`,
      })
      .from(serviceTransactions)
      .where(and(...conditions));

    // 2. Time-Series Revenue
    const timeSeriesGroup = await db
      .select({
        date: sql<string>`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`,
        revenue: sql<number>`sum(${serviceTransactions.amount})`,
      })
      .from(serviceTransactions)
      .where(and(...conditions))
      .groupBy(sql`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`);

    return {
      totalRevenue: summaryResult[0]?.totalRevenue || 0,
      totalServices: summaryResult[0]?.totalServices || 0,
      timeSeries: timeSeriesGroup.map((item) => ({
        date: item.date,
        revenue: Number(item.revenue) || 0,
      })),
    };
  }
}
