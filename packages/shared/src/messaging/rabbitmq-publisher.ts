import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  DomainEventConsumer,
  DomainEventMessage,
  DomainEventType,
  EventBusPort,
} from '../ports/event-bus.port';

export type RabbitPublisherConfig = {
  url: string;
  exchangeName?: string;
  routingKey?: string;
};

@Injectable()
export class RabbitMqPublisher implements EventBusPort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisher.name);
  private readonly exchangeName: string;
  private readonly routingKey: string;
  private connection?: import('amqplib').ChannelModel;
  private channel?: import('amqplib').Channel;
  private hasAttemptedConnection = false;

  constructor(private readonly config: RabbitPublisherConfig) {
    this.exchangeName = config.exchangeName ?? 'sheconnect.domain-events';
    this.routingKey = config.routingKey ?? 'domain.event';
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish<TPayload extends Record<string, unknown>>(
    eventType: DomainEventType,
    data: {
      userId?: string;
      entityId?: string;
      payload: TPayload;
    },
  ): Promise<void> {
    const channel = await this.getChannel();
    if (!channel) {
      this.logger.warn(`Skipping ${eventType} publication because RabbitMQ is not connected.`);
      return;
    }

    const event: DomainEventMessage<TPayload> = {
      eventType,
      userId: data.userId,
      entityId: data.entityId,
      payload: data.payload,
      createdAt: new Date().toISOString(),
    };

    channel.publish(this.exchangeName, this.routingKey, Buffer.from(JSON.stringify(event)), {
      contentType: 'application/json',
      persistent: true,
      type: eventType,
    });
  }

  async registerConsumer(_consumer: DomainEventConsumer): Promise<void> {
    // Publishers do not consume domain events.
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(await this.getChannel());
  }

  private async getChannel(): Promise<import('amqplib').Channel | undefined> {
    if (!this.channel) {
      await this.connect();
    }

    return this.channel;
  }

  private async connect(): Promise<void> {
    if (this.channel || this.hasAttemptedConnection) {
      return;
    }

    this.hasAttemptedConnection = true;

    try {
      const amqp = await import('amqplib');
      this.connection = await amqp.connect(this.config.url, { timeout: 3000 });
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    } catch (error) {
      this.logger.warn(
        `RabbitMQ publisher unavailable. ${error instanceof Error ? error.message : String(error)}`,
      );
      this.channel = undefined;
      await this.connection?.close().catch(() => undefined);
      this.connection = undefined;
    }
  }
}
