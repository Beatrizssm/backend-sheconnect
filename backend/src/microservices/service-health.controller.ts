import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Controller('health')
export class ServiceHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let postgres: 'UP' | 'DOWN' = 'DOWN';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      postgres = 'UP';
    } catch {
      postgres = 'DOWN';
    }

    return {
      service: process.env.SERVICE_NAME ?? 'unknown',
      api: 'UP',
      postgres,
      timestamp: new Date(),
    };
  }
}
