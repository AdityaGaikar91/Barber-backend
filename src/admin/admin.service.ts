import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, sql, count, desc } from 'drizzle-orm';

@Injectable()
export class AdminService {
  private readonly db = db;

  async getPlatformStats() {
    // Total tenants
    const [tenantsCount] = await this.db
      .select({ value: count() })
      .from(schema.tenants);

    // Total users
    const [usersCount] = await this.db
      .select({ value: count() })
      .from(schema.users);

    // Total revenue
    const [revenueResult] = await this.db
      .select({
        total: sql<number>`COALESCE(sum(${schema.serviceTransactions.amount}), 0)`,
      })
      .from(schema.serviceTransactions);

    // Total appointments
    const [appointmentsCount] = await this.db
      .select({ value: count() })
      .from(schema.appointments);

    // Total customers
    const [customersCount] = await this.db
      .select({ value: count() })
      .from(schema.customers);

    return {
      totalTenants: Number(tenantsCount.value) || 0,
      totalUsers: Number(usersCount.value) || 0,
      totalRevenue: Number(revenueResult.total) || 0,
      totalAppointments: Number(appointmentsCount.value) || 0,
      totalCustomers: Number(customersCount.value) || 0,
    };
  }

  async listAllTenants() {
    const tenants = await this.db.query.tenants.findMany({
      orderBy: desc(schema.tenants.createdAt),
    });

    // Enrich each tenant with employee count and revenue
    const enriched = await Promise.all(
      tenants.map(async (tenant) => {
        const [empCount] = await this.db
          .select({ value: count() })
          .from(schema.employees)
          .where(eq(schema.employees.tenantId, tenant.id));

        const [rev] = await this.db
          .select({
            total: sql<number>`COALESCE(sum(${schema.serviceTransactions.amount}), 0)`,
          })
          .from(schema.serviceTransactions)
          .where(eq(schema.serviceTransactions.tenantId, tenant.id));

        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          subscriptionTier: tenant.subscriptionTier,
          logoUrl: tenant.logoUrl,
          employeeCount: Number(empCount.value) || 0,
          revenue: Number(rev.total) || 0,
          createdAt: tenant.createdAt,
        };
      }),
    );

    return enriched;
  }

  async getTenantDetail(tenantId: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.id, tenantId),
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    // Users belonging to this tenant
    const tenantUsers = await this.db.query.users.findMany({
      where: eq(schema.users.tenantId, tenantId),
      columns: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Employees
    const tenantEmployees = await this.db
      .select({
        id: schema.employees.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.employees)
      .innerJoin(schema.users, eq(schema.employees.userId, schema.users.id))
      .where(eq(schema.employees.tenantId, tenantId));

    // Services
    const tenantServices = await this.db.query.services.findMany({
      where: eq(schema.services.tenantId, tenantId),
    });

    // Recent transactions (last 20)
    const recentTx = await this.db
      .select({
        id: schema.serviceTransactions.id,
        amount: schema.serviceTransactions.amount,
        timestamp: schema.serviceTransactions.timestamp,
        serviceName: schema.services.name,
      })
      .from(schema.serviceTransactions)
      .innerJoin(
        schema.services,
        eq(schema.serviceTransactions.serviceId, schema.services.id),
      )
      .where(eq(schema.serviceTransactions.tenantId, tenantId))
      .orderBy(desc(schema.serviceTransactions.timestamp))
      .limit(20);

    // Revenue
    const [rev] = await this.db
      .select({
        total: sql<number>`COALESCE(sum(${schema.serviceTransactions.amount}), 0)`,
      })
      .from(schema.serviceTransactions)
      .where(eq(schema.serviceTransactions.tenantId, tenantId));

    return {
      ...tenant,
      totalRevenue: Number(rev.total) || 0,
      users: tenantUsers,
      employees: tenantEmployees,
      services: tenantServices,
      recentTransactions: recentTx,
    };
  }

  async updateTenantSubscription(
    tenantId: string,
    tier: 'FREE' | 'PRO' | 'ENTERPRISE',
  ) {
    const validTiers = ['FREE', 'PRO', 'ENTERPRISE'];
    if (!validTiers.includes(tier)) {
      throw new NotFoundException('Invalid subscription tier');
    }

    const [updated] = await this.db
      .update(schema.tenants)
      .set({ subscriptionTier: tier, updatedAt: new Date() })
      .where(eq(schema.tenants.id, tenantId))
      .returning({
        id: schema.tenants.id,
        name: schema.tenants.name,
        subscriptionTier: schema.tenants.subscriptionTier,
      });

    if (!updated) throw new NotFoundException('Tenant not found');
    return updated;
  }
}
