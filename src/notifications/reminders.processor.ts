import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('appointments-queue')
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger(RemindersProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { appointmentId, tenantId, employeeId, startTime } = job.data;

    this.logger.log(`\n\n=== ACTION REQUIRED: OWNER REMINDER ===`);
    this.logger.log(`Job ID: ${job.id}`);
    this.logger.log(`Appointment ID: ${appointmentId}`);
    this.logger.log(`Tenant ID: ${tenantId}`);
    this.logger.log(`Employee ID: ${employeeId}`);
    this.logger.log(`Start Time: ${startTime}`);
    this.logger.log(
      `BODY: Reminder to follow up with the customer for this upcoming appointment.\n======================================\n`,
    );

    // In a real system, you would fetch the owner's email from the DB here
    // and send an email/sms. For now, we just log it as the mock.
    return { status: 'success', dispatchedTo: 'owner' };
  }
}
