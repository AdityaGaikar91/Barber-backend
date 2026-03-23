import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { db } from '../db';
import { serviceTransactions, customers, services } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('appointments-queue')
    private readonly appointmentsQueue: Queue,
  ) {}

  /**
   * Listens for the 'transaction.completed' event emitted immediately after a service is logged.
   * If a customer is attached to the transaction, we dispatch a "Thank you" notification.
   */
  @OnEvent('transaction.completed')
  async handleTransactionCompletedEvent(payload: {
    transactionId: string;
    tenantId: string;
    customerId?: string;
  }) {
    if (!payload.customerId) {
      return; // Walk-in customer, no notification sent
    }

    try {
      // Fetch customer details
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, payload.customerId));
      if (customer && (customer.email || customer.phone)) {
        // Simulate sending Email/SMS
        this.logger.log(`\n\n=== NOTIFICATION DISPATCHED ===`);
        this.logger.log(
          `TO: ${customer.name} (Email: ${customer.email || 'N/A'}, Phone: ${customer.phone || 'N/A'})`,
        );
        this.logger.log(`SUBJECT: Thank you for your visit!`);
        this.logger.log(
          `BODY: We appreciate your business at our shop today. See you next time!\n===============================\n`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to process transaction.completed event: ${errorMessage}`,
      );
    }
  }

  /**
   * Listens for new appointments and queues a reminder for the Owner.
   * Reminder is scheduled for 24 hours before the appointment.
   */
  @OnEvent('appointment.created')
  async handleNewAppointment(appointment: any) {
    try {
      this.logger.log(`Enqueuing Owner Reminder for appointment: ${appointment.id}`);
      
      const appointmentTime = new Date(appointment.appointmentTime).getTime();
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      // Calculate delay: 24 hours before the appointment. If less than 24h away, delay is 0.
      const delay = Math.max(appointmentTime - oneDayInMs - now, 0);

      await this.appointmentsQueue.add(
        'reminder',
        {
          appointmentId: appointment.id,
          tenantId: appointment.tenantId,
          employeeId: appointment.employeeId,
          startTime: appointment.appointmentTime,
        },
        { delay },
      );
      this.logger.log(`Reminder queued successfully. Delay: ${delay}ms`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to queue reminder for appointment: ${errorMessage}`);
    }
  }

  /**
   * Daily CRON Job: Runs every day at 10:00 AM.
   * Finds all transactions that occurred exactly 14 days ago (offset between 13.5 and 14.5 days visually,
   * or using pure date functions). Dispatches a "Time for a fresh cut!" reminder.
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleTwoWeekReminders() {
    this.logger.log('Starting daily 2-week reminder cron job...');

    try {
      // Find transactions from roughly 14 days ago where a customer exists
      // Since sqlite/pg dates can be tricky, we'll do 14 days ago on the application level
      const fourteenDaysAgoStart = new Date();
      fourteenDaysAgoStart.setDate(fourteenDaysAgoStart.getDate() - 14);
      fourteenDaysAgoStart.setHours(0, 0, 0, 0);

      const fourteenDaysAgoEnd = new Date(fourteenDaysAgoStart);
      fourteenDaysAgoEnd.setHours(23, 59, 59, 999);

      // We use query builder to find transactions strictly within that 24 hour bucket 14 days ago
      const transactionsToRemind = await db
        .select({
          transactionId: serviceTransactions.id,
          customerName: customers.name,
          customerEmail: customers.email,
          customerPhone: customers.phone,
          serviceName: services.name,
        })
        .from(serviceTransactions)
        .innerJoin(customers, eq(serviceTransactions.customerId, customers.id))
        .innerJoin(services, eq(serviceTransactions.serviceId, services.id))
        .where(
          and(
            sql`${serviceTransactions.timestamp} >= ${fourteenDaysAgoStart.toISOString()}`,
            sql`${serviceTransactions.timestamp} <= ${fourteenDaysAgoEnd.toISOString()}`,
            eq(serviceTransactions.status, 'COMPLETED'),
          ),
        );

      if (transactionsToRemind.length === 0) {
        this.logger.log(
          'No eligible 14-day old transactions found for reminders today.',
        );
        return;
      }

      for (const tx of transactionsToRemind) {
        if (tx.customerEmail || tx.customerPhone) {
          this.logger.log(`\n\n=== REMINDER DISPATCHED ===`);
          this.logger.log(
            `TO: ${tx.customerName} (Email: ${tx.customerEmail || 'N/A'}, Phone: ${tx.customerPhone || 'N/A'})`,
          );
          this.logger.log(`SUBJECT: Time for a fresh cut, ${tx.customerName}!`);
          this.logger.log(
            `BODY: It's been exactly 2 weeks since your last ${tx.serviceName}. Book your next appointment today!\n===========================\n`,
          );
        }
      }
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to process 2-week reminders: ${error.message}`);
    }
  }
}
