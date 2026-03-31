import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { RemindersProcessor } from './reminders.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appointments-queue',
    }),
  ],
  providers: [NotificationsService, RemindersProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
