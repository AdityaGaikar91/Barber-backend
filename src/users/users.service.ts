import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '../db';
<<<<<<< HEAD
=======
import { isDatabaseError } from '../db/database-error.interface';
>>>>>>> development
import { users, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  async findOneByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async create(data: RegisterDto & { passwordHash: string }) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);

    // Ensure email is unique
    const existingUser = await this.findOneByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Logic for creating a new OWNER and their shop (Tenant)
    if (data.role === 'OWNER') {
      if (!data.shopName) {
        throw new BadRequestException(
          'shopName is required when registering as an OWNER',
        );
      }

      // Create domain slug
      const domainSlug = data.shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      try {
<<<<<<< HEAD
        // Since neon-http doesn't natively support interactive transactions, we execute sequential awaits.
        const [newTenant] = await db
          .insert(tenants)
          .values({
            name: data.shopName,
            domain: domainSlug,
            slug: domainSlug,
            subscriptionTier: 'FREE',
          })
          .returning();

        try {
          const [newUser] = await db
=======
        const newUser = await db.transaction(async (tx) => {
          const [newTenant] = await tx
            .insert(tenants)
            .values({
              name: data.shopName!,
              domain: domainSlug,
              slug: domainSlug,
              subscriptionTier: 'FREE',
            })
            .returning();

          const [user] = await tx
>>>>>>> development
            .insert(users)
            .values({
              name: data.name,
              email: data.email,
              passwordHash: hashedPassword,
              role: data.role,
              tenantId: newTenant.id,
            })
            .returning();

<<<<<<< HEAD
          return newUser;
        } catch (userError: any) {
          // Rollback tenant creation manually if user creation fails
          await db.delete(tenants).where(eq(tenants.id, newTenant.id));
          throw userError;
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
          // Postgres unique violation
=======
          return user;
        });

        return newUser;
      } catch (error: unknown) {
        if (isDatabaseError(error) && error.code === '23505') {
>>>>>>> development
          throw new BadRequestException(
            'Domain or Shop Name might already exist.',
          );
        }
        throw new BadRequestException(
<<<<<<< HEAD
          `Failed to create tenant and user: ${error.message || 'Unknown error'}`,
=======
          `Failed to create tenant and user: ${error instanceof Error ? error.message : 'Unknown error'}`,
>>>>>>> development
        );
      }
    }

    // Standard user creation (Employee / Customer)
    if (!data.tenantId && data.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('tenantId is required for this role');
    }

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        tenantId: data.tenantId,
      })
      .returning();

    return newUser;
  }
}
