import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthModule } from '../modules/auth/jwt-auth.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { MetricsModule } from '../modules/metrics/metrics.module';
import { PersistenceModule } from '../modules/persistence.module';
import { MetricsController } from '../interfaces/controllers/metrics.controller';
import { ServiceHealthController } from './service-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_MS ?? 60000),
        limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
      },
    ]),
    JwtAuthModule,
    PersistenceModule,
    DashboardModule,
    MetricsModule,
  ],
  controllers: [ServiceHealthController, MetricsController],
})
export class AppDataModule {}
