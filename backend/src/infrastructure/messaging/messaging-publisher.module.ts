import { Module } from '@nestjs/common';
import { EVENT_BUS } from '../../application/ports/event-bus.port';
import { RabbitMqPublisherService } from './rabbitmq-publisher.service';

@Module({
  providers: [
    RabbitMqPublisherService,
    {
      provide: EVENT_BUS,
      useExisting: RabbitMqPublisherService,
    },
  ],
  exports: [EVENT_BUS, RabbitMqPublisherService],
})
export class MessagingPublisherModule {}
