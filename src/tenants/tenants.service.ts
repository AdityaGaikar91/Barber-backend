import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
<<<<<<< HEAD
import { tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
=======
import { isDatabaseError } from '../db/database-error.interface';
import { tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateTenantSettingsDto } from './dto/update-tenant.dto';
>>>>>>> development

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
<<<<<<< HEAD
      }
=======
      },
>>>>>>> development
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

<<<<<<< HEAD
  async updateSettings(tenantId: string, data: any) {
=======
  async updateSettings(tenantId: string, data: UpdateTenantSettingsDto) {
>>>>>>> development
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
<<<<<<< HEAD
    } catch (e: any) {
      if (e.code === '23505') {
         throw new Error('This public URL slug is already taken by another shop.');
=======
    } catch (e: unknown) {
      if (isDatabaseError(e) && e.code === '23505') {
        throw new Error(
          'This public URL slug is already taken by another shop.',
        );
>>>>>>> development
      }
      throw e;
    }
  }
}
