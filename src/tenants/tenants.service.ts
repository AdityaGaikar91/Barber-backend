import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { isDatabaseError } from '../db/database-error.interface';
import { tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateTenantSettingsDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  async getSettings(tenantId: string) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      columns: {
        id: true,
        name: true,
        domain: true,
        slug: true,
        logoUrl: true,
        businessHours: true,
        subscriptionTier: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateSettings(tenantId: string, data: UpdateTenantSettingsDto) {
    try {
      const [updated] = await db
        .update(tenants)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
        .returning({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          logoUrl: tenants.logoUrl,
          businessHours: tenants.businessHours,
        });

      if (!updated) throw new NotFoundException('Tenant not found');
      return updated;
    } catch (e: unknown) {
      if (isDatabaseError(e) && e.code === '23505') {
        throw new Error(
          'This public URL slug is already taken by another shop.',
        );
      }
      throw e;
    }
  }
}
