import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AUDIT_LOGGER } from '../../application/ports/audit-log.port';
import { DatabaseModule } from '../database/database.module';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaAuditLoggerService } from './prisma-audit-logger.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditLogsController],
  providers: [
    PrismaAuditLoggerService,
    AuditLogQueryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: AUDIT_LOGGER,
      useExisting: PrismaAuditLoggerService,
    },
  ],
  exports: [AUDIT_LOGGER],
})
export class AuditModule {}
