import { Injectable } from '@nestjs/common';
import { db } from '../db';
import {
  customers,
  serviceTransactions,
  employees,
  services,
  users,
} from '../db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  async getDashboardMetrics(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Base conditions
    const conditions = [eq(serviceTransactions.tenantId, tenantId)];
    const customerConditions = [eq(customers.tenantId, tenantId)];

    if (startDate) {
      const startD = new Date(startDate);
      startD.setHours(0, 0, 0, 0); // normalize timezone
      conditions.push(
        sql`${serviceTransactions.timestamp} >= ${startD.toISOString()}`,
      );
      customerConditions.push(
        sql`${customers.createdAt} >= ${startD.toISOString()}`,
      );
    }
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      conditions.push(
        sql`${serviceTransactions.timestamp} <= ${endD.toISOString()}`,
      );
      customerConditions.push(
        sql`${customers.createdAt} <= ${endD.toISOString()}`,
      );
    }

    // --- At-a-Glance helper for Today/Yesterday/MTD ---
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const yesterdayStart = new Date(
      new Date().setDate(new Date().getDate() - 1),
    ).toISOString();
    const yesterdayEnd = todayStart;
    const monthStart = new Date(new Date().setDate(1)).toISOString();

    const [atGlance] = await db
      .select({
        today: sql<number>`sum(CASE WHEN ${serviceTransactions.timestamp} >= ${todayStart} THEN ${serviceTransactions.amount} ELSE 0 END)`,
        yesterday: sql<number>`sum(CASE WHEN ${serviceTransactions.timestamp} >= ${yesterdayStart} AND ${serviceTransactions.timestamp} < ${yesterdayEnd} THEN ${serviceTransactions.amount} ELSE 0 END)`,
        mtd: sql<number>`sum(CASE WHEN ${serviceTransactions.timestamp} >= ${monthStart} THEN ${serviceTransactions.amount} ELSE 0 END)`,
      })
      .from(serviceTransactions)
      .where(eq(serviceTransactions.tenantId, tenantId));

    // 1. Total Distinct Customers in Range (New feature vs just counting all)
    // For 'totalCustomers', let's report total database customers created in range, OR
    // just keep it simple: ALL customers in the tenant that match range.
    const customersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(and(...customerConditions));

    // 2. Total Revenue in Date Range
    const revenueResult = await db
      .select({ total: sql<number>`sum(${serviceTransactions.amount})` })
      .from(serviceTransactions)
      .where(and(...conditions));

    // 3. Top Employee in Date Range
    const topEmployeeResult = await db
      .select({
        employeeId: serviceTransactions.employeeId,
        revenue: sql<number>`sum(${serviceTransactions.amount})`,
        employeeName: users.name,
      })
      .from(serviceTransactions)
      .innerJoin(employees, eq(serviceTransactions.employeeId, employees.id))
      .innerJoin(users, eq(employees.userId, users.id))
      .where(and(...conditions))
      .groupBy(serviceTransactions.employeeId, users.name)
      .orderBy(desc(sql`sum(${serviceTransactions.amount})`))
      .limit(1);

    // 4. Time-Series Revenue (Daily)
    // Group by YYYY-MM-DD
    const timeSeriesGroup = await db
      .select({
        date: sql<string>`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`,
        revenue: sql<number>`sum(${serviceTransactions.amount})`,
      })
      .from(serviceTransactions)
      .where(and(...conditions))
      .groupBy(sql`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${serviceTransactions.timestamp}, 'YYYY-MM-DD')`);

    // 5. Top Services Performance
    const topServicesGroup = await db
      .select({
        serviceId: serviceTransactions.serviceId,
        serviceName: services.name,
        revenue: sql<number>`sum(${serviceTransactions.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(serviceTransactions)
      .innerJoin(services, eq(serviceTransactions.serviceId, services.id))
      .where(and(...conditions))
      .groupBy(serviceTransactions.serviceId, services.name)
      .orderBy(desc(sql`sum(${serviceTransactions.amount})`))
      .limit(5);

    return {
      totalCustomers: customersCountResult[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      todayRevenue: Number(atGlance?.today) || 0,
      yesterdayRevenue: Number(atGlance?.yesterday) || 0,
      monthToDateRevenue: Number(atGlance?.mtd) || 0,
      topEmployeeId: topEmployeeResult[0]?.employeeId || null,
      topEmployeeName: topEmployeeResult[0]?.employeeName || null,
      topEmployeeRevenue: topEmployeeResult[0]?.revenue || 0,
      timeSeries: timeSeriesGroup.map((item) => ({
        date: item.date,
        revenue: Number(item.revenue) || 0,
      })),
      topServices: topServicesGroup.map((item) => ({
        id: item.serviceId,
        name: item.serviceName,
        revenue: Number(item.revenue) || 0,
        count: Number(item.count) || 0,
      })),
    };
  }

  async getRecentActivity(tenantId: string, limit: number = 10, page: number = 1) {
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(serviceTransactions)
      .where(eq(serviceTransactions.tenantId, tenantId));

    const [totalResult] = await baseQuery;
    const total = Number(totalResult?.count) || 0;

    const recentTx = await db
      .select({
        id: serviceTransactions.id,
        amount: serviceTransactions.amount,
        timestamp: serviceTransactions.timestamp,
        status: serviceTransactions.status,
        serviceName: services.name,
        employeeName: users.name,
        customerName: customers.name,
      })
      .from(serviceTransactions)
      .innerJoin(services, eq(serviceTransactions.serviceId, services.id))
      .innerJoin(employees, eq(serviceTransactions.employeeId, employees.id))
      .innerJoin(users, eq(employees.userId, users.id))
      .leftJoin(customers, eq(serviceTransactions.customerId, customers.id))
      .where(eq(serviceTransactions.tenantId, tenantId))
      .orderBy(desc(serviceTransactions.timestamp))
      .limit(limit)
      .offset(offset);

    const data = recentTx.map((tx) => ({
      ...tx,
      customerName: tx.customerName || 'Walk-in Customer',
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
