import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService],
=======
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
>>>>>>> development
  exports: [NotificationsService],
})
export class NotificationsModule {}
