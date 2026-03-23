import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly db = db;

  // Public method: Fetch available services and employees for a specific slug
  async getPublicBookingInfo(slug: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, slug),
    });

    if (!tenant) throw new NotFoundException('Barbershop not found');

    const tenantServices = await this.db.query.services.findMany({
      where: and(
        eq(schema.services.tenantId, tenant.id),
        eq(schema.services.isActive, true),
      ),
    });

    const tenantEmployeesFields = await this.db
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
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, dto.tenantSlug),
    });

    if (!tenant) throw new NotFoundException('Barbershop not found');

    const allServices = await this.db.query.services.findMany({
      where: eq(schema.services.tenantId, tenant.id)
    });
    
    // Validate and order services as requested
    const servicesToBook = dto.serviceIds.map(id => {
       const s = allServices.find(s => s.id === id);
       if (!s) throw new NotFoundException(`Service not found: ${id}`);
       return s;
    });

    const totalDuration = servicesToBook.reduce((acc, curr) => acc + curr.duration, 0);

    const appointmentStart = new Date(dto.appointmentTime);
    const appointmentEnd = new Date(
      appointmentStart.getTime() + totalDuration * 60000,
    );

    let customerId = null;
    if (dto.customerPhone) {
      const [existingCus] = await this.db.select().from(schema.customers)
         .where(and(eq(schema.customers.tenantId, tenant.id), eq(schema.customers.phone, dto.customerPhone)));
      if (existingCus) {
         customerId = existingCus.id;
      } else {
         const [newCus] = await this.db.insert(schema.customers).values({
            tenantId: tenant.id,
            name: dto.customerName,
            phone: dto.customerPhone,
         }).returning();
         customerId = newCus.id;
      }
    }

    // Conflict check
    const conflicts = await this.db
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
      throw new BadRequestException('This time slot is no longer available');
    }

    const appointmentsToInsert = [];
    let currentStartTime = new Date(appointmentStart.getTime());

    for (const serv of servicesToBook) {
        const currentEndTime = new Date(currentStartTime.getTime() + serv.duration * 60000);
        
        appointmentsToInsert.push({
            tenantId: tenant.id,
            customerId: customerId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone || null,
            serviceId: serv.id,
            employeeId: dto.employeeId,
            appointmentTime: new Date(currentStartTime), // Duplicate explicitly to avoid reference issues
            endTime: currentEndTime,
            status: 'PENDING' as const,
        });
        
        currentStartTime = currentEndTime;
    }

    const insertedAppointments = await this.db
      .insert(schema.appointments)
      .values(appointmentsToInsert)
      .returning();

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

    return this.db.query.appointments.findMany({
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
    const appointment = await this.db.query.appointments.findFirst({
      where: and(
        eq(schema.appointments.id, appointmentId),
        eq(schema.appointments.tenantId, tenantId),
      ),
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const [updated] = await this.db
      .update(schema.appointments)
      .set({ status })
      .where(eq(schema.appointments.id, appointmentId))
      .returning();

    return updated;
  }
}
