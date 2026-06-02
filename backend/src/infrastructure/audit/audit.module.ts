import { Module } from '@nestjs/common';
import { AUDIT_LOGGER } from '../../application/ports/audit-log.port';
import { DatabaseModule } from '../database/database.module';
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
      provide: AUDIT_LOGGER,
      useExisting: PrismaAuditLoggerService,
    },
  ],
  exports: [AUDIT_LOGGER],
})
export class AuditModule {}
