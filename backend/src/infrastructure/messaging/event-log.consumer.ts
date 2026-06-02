import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEventMessage, EVENT_BUS, EventBusPort } from '../../application/ports/event-bus.port';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class EventLogConsumer implements OnModuleInit {
  private readonly logger = new Logger(EventLogConsumer.name);

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly mongo: MongoService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.registerConsumer((event) => this.persistEvent(event));
  }

  private async persistEvent(event: DomainEventMessage): Promise<void> {
    try {
      await this.mongo.eventLogs.insertOne({
        eventType: event.eventType,
        userId: event.userId,
        entityId: event.entityId,
        payload: event.payload,
        createdAt: new Date(event.createdAt),
      });
    } catch (error) {
      this.logger.error('Failed to persist domain event in MongoDB', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
