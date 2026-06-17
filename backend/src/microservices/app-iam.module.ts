import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditLoggerModule } from '../infrastructure/audit/audit-logger.module';
import { AuthModule } from '../modules/auth/auth.module';
import { PersistenceModule } from '../modules/persistence.module';
import { UsersModule } from '../modules/users/users.module';
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
    AuditLoggerModule,
    PersistenceModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ServiceHealthController],
})
export class AppIamModule {}
