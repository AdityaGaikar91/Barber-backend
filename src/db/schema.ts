import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  boolean,
  integer,
  unique,
  jsonb,
} from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  domain: text('domain').unique(),
  slug: text('slug').unique(), // For public booking URLs
  logoUrl: text('logo_url'),
  businessHours: jsonb('business_hours'),
  subscriptionTier: text('subscription_tier').default('FREE').notNull(), // 'FREE', 'PRO', 'ENTERPRISE'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id').references(() => tenants.id), // Nullable for Super Admin
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'SUPER_ADMIN', 'OWNER', 'EMPLOYEE', 'CUSTOMER'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employees = pgTable('employees', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .unique()
    .notNull(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customers = pgTable(
  'customers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .references(() => tenants.id)
      .notNull(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    unqEmailTenant: unique().on(t.tenantId, t.email),
    unqPhoneTenant: unique().on(t.tenantId, t.phone),
  }),
);

export const services = pgTable('services', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: doublePrecision('price').notNull(),
  duration: integer('duration').notNull(), // Minutes
  category: text('category'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serviceTransactions = pgTable('service_transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  serviceId: text('service_id')
    .references(() => services.id)
    .notNull(),
  employeeId: text('employee_id')
    .references(() => employees.id)
    .notNull(),
  customerId: text('customer_id').references(() => customers.id),
  amount: doublePrecision('amount').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  status: text('status').default('COMPLETED').notNull(), // 'PENDING', 'COMPLETED', 'CANCELLED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const offers = pgTable('offers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  title: text('title').notNull(),
  discountPercentage: doublePrecision('discount_percentage').notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  customerId: text('customer_id').references(() => customers.id), // Nullable for guest bookings
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  serviceId: text('service_id')
    .references(() => services.id)
    .notNull(),
  employeeId: text('employee_id')
    .references(() => employees.id)
    .notNull(),
  appointmentTime: timestamp('appointment_time').notNull(),
  endTime: timestamp('end_time').notNull(), // Required to lock calendar blocks easily
  status: text('status').default('PENDING').notNull(), // 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

import { relations } from 'drizzle-orm';
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
}));
