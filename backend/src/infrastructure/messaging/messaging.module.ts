import { Module } from '@nestjs/common';
import { EVENT_BUS } from '../../application/ports/event-bus.port';
import { DatabaseModule } from '../database/database.module';
import { MongoModule } from '../mongo/mongo.module';
import { AnalyticsConsumer } from './analytics.consumer';
import { AuditConsumer } from './audit.consumer';
import { EventLogConsumer } from './event-log.consumer';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [MongoModule, DatabaseModule],
  providers: [
    RabbitMqService,
    EventLogConsumer,
    AuditConsumer,
    AnalyticsConsumer,
    {
      provide: EVENT_BUS,
      useExisting: RabbitMqService,
    },
  ],
  exports: [EVENT_BUS, RabbitMqService],
})
export class MessagingModule {}
