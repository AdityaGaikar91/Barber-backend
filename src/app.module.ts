import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CustomersModule } from './customers/customers.module';
import { OffersModule } from './offers/offers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppointmentsModule } from './appointments/appointments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TenantsModule } from './tenants/tenants.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 60 }],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    ServicesModule,
    EmployeesModule,
    AnalyticsModule,
    CustomersModule,
    OffersModule,
    NotificationsModule,
    AppointmentsModule,
    SubscriptionsModule,
    TenantsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
