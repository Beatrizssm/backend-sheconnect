import { Module } from '@nestjs/common';
import { EVENT_BUS } from '../../application/ports/event-bus.port';
import { RabbitMqEventBusService } from './rabbitmq-event-bus.service';

@Module({
  providers: [
    RabbitMqEventBusService,
    {
      provide: EVENT_BUS,
      useExisting: RabbitMqEventBusService,
    },
  ],
  exports: [EVENT_BUS],
})
export class EventBusModule {}
