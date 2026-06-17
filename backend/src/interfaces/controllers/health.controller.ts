import { Controller, Get, Optional } from '@nestjs/common';
import { MongoService } from '../../infrastructure/mongo/mongo.service';
import { RabbitMqPublisherService } from '../../infrastructure/messaging/rabbitmq-publisher.service';
import { RabbitMqService } from '../../infrastructure/messaging/rabbitmq.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly mongo?: MongoService,
    @Optional() private readonly rabbitMq?: RabbitMqService,
    @Optional() private readonly rabbitPublisher?: RabbitMqPublisherService,
  ) {}

  @Get()
  async check() {
    const [postgres, mongodb, rabbitmq] = await Promise.all([
      this.checkPostgres(),
      this.checkMongo(),
      this.checkRabbitMq(),
    ]);

    return {
      api: 'UP',
      postgres,
      mongodb,
      rabbitmq,
      timestamp: new Date(),
    };
  }

  private async checkPostgres(): Promise<'UP' | 'DOWN'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'UP';
    } catch {
      return 'DOWN';
    }
  }

  private async checkMongo(): Promise<'UP' | 'DOWN'> {
    if (!this.mongo) {
      return 'DOWN';
    }

    try {
      return (await this.mongo.isHealthy()) ? 'UP' : 'DOWN';
    } catch {
      return 'DOWN';
    }
  }

  private async checkRabbitMq(): Promise<'UP' | 'DOWN'> {
    try {
      if (this.rabbitMq) {
        return (await this.rabbitMq.isHealthy()) ? 'UP' : 'DOWN';
      }

      if (this.rabbitPublisher) {
        return (await this.rabbitPublisher.isHealthy()) ? 'UP' : 'DOWN';
      }

      return 'DOWN';
    } catch {
      return 'DOWN';
    }
  }
}
