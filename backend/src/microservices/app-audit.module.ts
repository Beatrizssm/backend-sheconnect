import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditApiModule } from '../infrastructure/audit/audit-api.module';
import { JwtAuthModule } from '../modules/auth/jwt-auth.module';
import { PersistenceModule } from '../modules/persistence.module';
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
    AuditApiModule,
  ],
  controllers: [ServiceHealthController],
})
export class AppAuditModule {}
