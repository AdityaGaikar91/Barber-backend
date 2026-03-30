import { Injectable, ForbiddenException } from '@nestjs/common';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, count, and, gte } from 'drizzle-orm';

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxEmployees: 1,
    maxTransactionsPerMonth: 50,
  },
  [SubscriptionTier.PRO]: {
    maxEmployees: Infinity,
    maxTransactionsPerMonth: Infinity,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxEmployees: Infinity,
    maxTransactionsPerMonth: Infinity,
  },
};

@Injectable()
export class SubscriptionsService {
<<<<<<< HEAD
  private readonly db = db;

  async getTenantTier(tenantId: string): Promise<SubscriptionTier> {
    const tenant = await this.db.query.tenants.findFirst({
=======
  async getTenantTier(tenantId: string): Promise<SubscriptionTier> {
    const tenant = await db.query.tenants.findFirst({
>>>>>>> development
      where: eq(schema.tenants.id, tenantId),
    });
    return (
      (tenant?.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE
    );
  }

  async checkEmployeeAvailability(tenantId: string) {
    const tier = await this.getTenantTier(tenantId);
    const limits = TIER_LIMITS[tier];

    if (limits.maxEmployees === Infinity) return true;

<<<<<<< HEAD
    const [result] = await this.db
=======
    const [result] = await db
>>>>>>> development
      .select({ value: count() })
      .from(schema.employees)
      .where(eq(schema.employees.tenantId, tenantId));

    if (Number(result.value) >= limits.maxEmployees) {
      throw new ForbiddenException(
        `Your ${tier} plan only allows ${limits.maxEmployees} employee(s). Please upgrade for more.`,
      );
    }
    return true;
  }

  async checkTransactionAvailability(tenantId: string) {
    const tier = await this.getTenantTier(tenantId);
    const limits = TIER_LIMITS[tier];

    if (limits.maxTransactionsPerMonth === Infinity) return true;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

<<<<<<< HEAD
    const [result] = await this.db
=======
    const [result] = await db
>>>>>>> development
      .select({ value: count() })
      .from(schema.serviceTransactions)
      .where(
        and(
          eq(schema.serviceTransactions.tenantId, tenantId),
          gte(schema.serviceTransactions.timestamp, startOfMonth),
        ),
      );

    if (Number(result.value) >= limits.maxTransactionsPerMonth) {
      throw new ForbiddenException(
        `Your ${tier} plan only allows ${limits.maxTransactionsPerMonth} transactions per month. Please upgrade your plan.`,
      );
    }
    return true;
  }

  async isPro(tenantId: string): Promise<boolean> {
    const tier = await this.getTenantTier(tenantId);
    return (
      tier === SubscriptionTier.PRO || tier === SubscriptionTier.ENTERPRISE
    );
  }
}
