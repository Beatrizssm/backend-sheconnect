import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { DomainEventConsumer, DomainEventMessage, EventBusPort } from '../../application/ports/event-bus.port';

@Injectable()
export class RabbitMqConsumerService implements EventBusPort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqConsumerService.name);
  private readonly exchangeName = 'sheconnect.domain-events';
  private readonly routingKey = 'domain.event';
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;
  private readonly consumers: DomainEventConsumer[] = [];
  private isConsuming = false;
  private hasAttemptedConnection = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.startConsumer();
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(): Promise<void> {
    this.logger.warn('RabbitMQ consumer service does not publish events.');
  }

  async registerConsumer(consumer: DomainEventConsumer): Promise<void> {
    this.consumers.push(consumer);
    await this.startConsumer();
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(this.channel);
  }

  private get queueName(): string {
    return this.configService.get<string>('RABBITMQ_QUEUE_NAME', 'sheconnect.event-logs');
  }

  private async startConsumer(): Promise<void> {
    if (this.isConsuming || this.consumers.length === 0) {
      return;
    }

    const channel = this.channel;
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
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);
    } catch (error) {
      this.logger.warn(
        `RabbitMQ consumer unavailable. Continuing without messaging. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.channel = undefined;
      await this.connection?.close().catch(() => undefined);
      this.connection = undefined;
    }
  }
}
