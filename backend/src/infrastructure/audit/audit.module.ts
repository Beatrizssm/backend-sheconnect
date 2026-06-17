import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditLogsController],
  providers: [
    AuditLogQueryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AuditModule {}
