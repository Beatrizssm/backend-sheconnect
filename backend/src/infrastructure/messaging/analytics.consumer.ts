import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEventMessage, EVENT_BUS, EventBusPort } from '../../application/ports/event-bus.port';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class AnalyticsConsumer implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsConsumer.name);

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly mongo: MongoService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.registerConsumer((event) => this.persistAnalyticsEvent(event));
  }

  private async persistAnalyticsEvent(event: DomainEventMessage): Promise<void> {
    try {
      await this.mongo.eventLogs.insertOne({
        eventType: `ANALYTICS_${event.eventType}`,
        userId: event.userId,
        entityId: event.entityId,
        payload: {
          originalEventType: event.eventType,
          occurredAt: event.createdAt,
        },
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.warn(`Analytics consumer skipped event ${event.eventType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
