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
export class RabbitMqService implements EventBusPort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly exchangeName = 'sheconnect.domain-events';
  private readonly queueName = 'sheconnect.event-logs';
  private readonly routingKey = 'domain.event';
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;
  private readonly consumers: DomainEventConsumer[] = [];
  private isConsuming = false;

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

  async registerConsumer(consumer: DomainEventConsumer): Promise<void> {
    this.consumers.push(consumer);
    await this.startConsumer();
  }

  private async startConsumer(): Promise<void> {
    if (this.isConsuming || this.consumers.length === 0) {
      return;
    }

    const channel = await this.getChannel();
    if (!channel) {
      return;
    }

    await channel.consume(this.queueName, async (message) => {
      if (!message) {
        return;
      }

      try {
        const event = JSON.parse(message.content.toString()) as DomainEventMessage;
        await Promise.all(this.consumers.map((consumer) => consumer(event)));
        channel.ack(message);
      } catch (error) {
        this.logger.error('Failed to consume domain event', error instanceof Error ? error.stack : String(error));
        channel.nack(message, false, false);
      }
    });
    this.isConsuming = true;
  }

  private async getChannel(): Promise<amqp.Channel | undefined> {
    if (!this.channel) {
      await this.connect();
    }

    return this.channel;
  }

  private async connect(): Promise<void> {
    if (this.channel) {
      return;
    }

    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://sheconnect:sheconnect@localhost:5672');
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);
    } catch (error) {
      this.logger.warn(
        `RabbitMQ connection unavailable. Continuing without messaging. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.channel = undefined;
      await this.connection?.close().catch(() => undefined);
      this.connection = undefined;
    }
  }
}
