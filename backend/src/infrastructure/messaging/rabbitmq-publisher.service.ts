import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  DomainEventConsumer,
  DomainEventMessage,
  DomainEventType,
  EventBusPort,
} from '../../application/ports/event-bus.port';

@Injectable()
export class RabbitMqPublisherService implements EventBusPort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisherService.name);
  private readonly exchangeName = 'sheconnect.domain-events';
  private readonly routingKey = 'domain.event';
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;
  private hasAttemptedConnection = false;

  constructor(private readonly configService: ConfigService) {}

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
    const channel = await this.getChannel();
    return Boolean(channel);
  }

  private async getChannel(): Promise<amqp.Channel | undefined> {
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
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://sheconnect:sheconnect@localhost:5672');

    try {
      this.connection = await amqp.connect(url, { timeout: 3000 });
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    } catch (error) {
      this.logger.warn(
        `RabbitMQ publisher unavailable. Continuing without messaging. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.channel = undefined;
      await this.connection?.close().catch(() => undefined);
      this.connection = undefined;
    }
  }
}
