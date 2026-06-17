import { Module } from '@nestjs/common';
import { EVENT_BUS } from '../../application/ports/event-bus.port';
import { RabbitMqConsumerService } from './rabbitmq-consumer.service';

@Module({
  providers: [
    RabbitMqConsumerService,
    {
      provide: EVENT_BUS,
      useExisting: RabbitMqConsumerService,
    },
  ],
  exports: [EVENT_BUS, RabbitMqConsumerService],
})
export class MessagingConsumerModule {}
