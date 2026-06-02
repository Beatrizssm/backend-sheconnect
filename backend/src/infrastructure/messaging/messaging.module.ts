import { Module } from '@nestjs/common';
import { EVENT_BUS } from '../../application/ports/event-bus.port';
import { MongoModule } from '../mongo/mongo.module';
import { EventLogConsumer } from './event-log.consumer';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [MongoModule],
  providers: [
    RabbitMqService,
    EventLogConsumer,
    {
      provide: EVENT_BUS,
      useExisting: RabbitMqService,
    },
  ],
  exports: [EVENT_BUS, RabbitMqService],
})
export class MessagingModule {}
