import { Controller, Get } from '@nestjs/common';
import { MongoService } from '../../infrastructure/mongo/mongo.service';
import { RabbitMqService } from '../../infrastructure/messaging/rabbitmq.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongo: MongoService,
    private readonly rabbitMq: RabbitMqService,
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
    try {
      return (await this.mongo.isHealthy()) ? 'UP' : 'DOWN';
    } catch {
      return 'DOWN';
    }
  }

  private async checkRabbitMq(): Promise<'UP' | 'DOWN'> {
    try {
      return (await this.rabbitMq.isHealthy()) ? 'UP' : 'DOWN';
    } catch {
      return 'DOWN';
    }
  }
}
