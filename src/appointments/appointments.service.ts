import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and, gte, lte, or, sql } from 'drizzle-orm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppointmentsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Public method: Fetch available services and employees for a specific slug
  async getPublicBookingInfo(slug: string) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, slug),
    });

    if (!tenant) throw new NotFoundException('Barbershop not found');

    const tenantServices = await db.query.services.findMany({
      where: and(
        eq(schema.services.tenantId, tenant.id),
        eq(schema.services.isActive, true),
      ),
    });

    const tenantEmployeesFields = await db
      .select({
        id: schema.employees.id,
        bio: schema.employees.bio,
        name: schema.users.name,
      })
      .from(schema.employees)
      .innerJoin(schema.users, eq(schema.employees.userId, schema.users.id))
      .where(eq(schema.employees.tenantId, tenant.id));

    return {
      services: tenantServices,
      employees: tenantEmployeesFields,
      shopName: tenant.name,
      logoUrl: tenant.logoUrl,
    };
  }

  // Public method: Create a pending appointment
  async createAppointment(dto: CreateAppointmentDto) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, dto.tenantSlug),
    });

    if (!tenant) throw new NotFoundException('Barbershop not found');

    const allServices = await db.query.services.findMany({
      where: eq(schema.services.tenantId, tenant.id),
    });

    // Validate and order services as requested
    const servicesToBook = dto.serviceIds.map((id) => {
      const s = allServices.find((s) => s.id === id);
      if (!s) throw new NotFoundException(`Service not found: ${id}`);
      return s;
    });

    const totalDuration = servicesToBook.reduce(
      (acc, curr) => acc + curr.duration,
      0,
    );

    const appointmentStart = new Date(dto.appointmentTime);
    const appointmentEnd = new Date(
      appointmentStart.getTime() + totalDuration * 60000,
    );

    let customerId = null;
    if (dto.customerPhone) {
      const [existingCus] = await db
        .select()
        .from(schema.customers)
        .where(
          and(
            eq(schema.customers.tenantId, tenant.id),
            eq(schema.customers.phone, dto.customerPhone),
          ),
        );
      if (existingCus) {
        customerId = existingCus.id;
      } else {
        const [newCus] = await db
          .insert(schema.customers)
          .values({
            tenantId: tenant.id,
            name: dto.customerName,
            phone: dto.customerPhone,
          })
          .returning();
        customerId = newCus.id;
      }
    }

    // Conflict check + insert wrapped in serializable transaction to prevent double-booking
    const insertedAppointments = await db.transaction(
      async (tx) => {
        const conflicts = await tx
          .select()
          .from(schema.appointments)
          .where(
            and(
              eq(schema.appointments.employeeId, dto.employeeId),
              or(
                eq(schema.appointments.status, 'APPROVED'),
                eq(schema.appointments.status, 'PENDING'),
              ),
              and(
                lte(schema.appointments.appointmentTime, appointmentEnd),
                gte(schema.appointments.endTime, appointmentStart),
              ),
            ),
          );

        if (conflicts.length > 0) {
          throw new BadRequestException(
            'This time slot is no longer available',
          );
        }

        const appointmentsToInsert = [];
        let currentStartTime = new Date(appointmentStart.getTime());

        for (const serv of servicesToBook) {
          const currentEndTime = new Date(
            currentStartTime.getTime() + serv.duration * 60000,
          );

          appointmentsToInsert.push({
            tenantId: tenant.id,
            customerId: customerId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone || null,
            serviceId: serv.id,
            employeeId: dto.employeeId,
            appointmentTime: new Date(currentStartTime),
            endTime: currentEndTime,
            status: 'PENDING' as const,
          });

          currentStartTime = currentEndTime;
        }

        return tx
          .insert(schema.appointments)
          .values(appointmentsToInsert)
          .returning();
      },
      { isolationLevel: 'serializable' },
    );

    // Emit event for all successfully created appointments
    insertedAppointments.forEach((appt) => {
      this.eventEmitter.emit('appointment.created', appt);
    });

    return insertedAppointments;
  }

  // Owner method: Get upcoming appointments
  async getTenantAppointments(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const conditions = [eq(schema.appointments.tenantId, tenantId)];

    if (startDate) {
      conditions.push(
        gte(schema.appointments.appointmentTime, new Date(startDate)),
      );
    }
    if (endDate) {
      conditions.push(
        lte(schema.appointments.appointmentTime, new Date(endDate)),
      );
    }

    return db.query.appointments.findMany({
      where: and(...conditions),
      with: {
        service: true,
        employee: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (appointments, { asc }) => [asc(appointments.appointmentTime)],
    });
  }

  // Owner method: Update appointment status (Approve, Cancel, Complete)
  async updateAppointmentStatus(
    tenantId: string,
    appointmentId: string,
    status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED',
  ) {
    const appointment = await db.query.appointments.findFirst({
      where: and(
        eq(schema.appointments.id, appointmentId),
        eq(schema.appointments.tenantId, tenantId),
      ),
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const [updated] = await db
      .update(schema.appointments)
      .set({ status })
      .where(eq(schema.appointments.id, appointmentId))
      .returning();

    if (updated) {
      if (status === 'CANCELLED') {
        this.eventEmitter.emit('appointment.cancelled', updated);
      } else {
        this.eventEmitter.emit('appointment.updated', updated);
      }
    }

    return updated;
  }

  // Fetch appointments specifically assigned to the logged-in employee (via their userId)
  async getEmployeeAppointments(
    tenantId: string,
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // 1. Find the employee record linked to this user
    const [employee] = await db
      .select({ id: schema.employees.id })
      .from(schema.employees)
      .where(and(eq(schema.employees.userId, userId), eq(schema.employees.tenantId, tenantId)));

    if (!employee) {
      throw new BadRequestException('Logged-in user is not registered as an employee for this tenant.');
    }

    const conditions = [
      eq(schema.appointments.tenantId, tenantId),
      eq(schema.appointments.employeeId, employee.id),
    ];

    if (startDate) {
      conditions.push(
        sql`${schema.appointments.appointmentTime} >= ${new Date(startDate).toISOString()}`,
      );
    }
    if (endDate) {
      // Append time if only date is provided
      const endDateTime = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;
      conditions.push(
        sql`${schema.appointments.appointmentTime} <= ${new Date(endDateTime).toISOString()}`,
      );
    }

    return await db.query.appointments.findMany({
      where: and(...conditions),
      with: {
        service: {
          columns: {
            name: true,
            price: true,
            duration: true,
          },
        },
        employee: {
          with: {
            user: {
              columns: { name: true },
            },
          },
        },
      },
      orderBy: (appointments, { asc }) => [asc(appointments.appointmentTime)],
    });
  }
}

