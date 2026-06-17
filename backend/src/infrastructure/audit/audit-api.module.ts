import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MessagingConsumerModule } from '../messaging/messaging-consumer.module';
import { AuditConsumer } from '../messaging/audit.consumer';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [DatabaseModule, MessagingConsumerModule],
  controllers: [AuditLogsController],
  providers: [AuditLogQueryService, AuditConsumer],
})
export class AuditApiModule {}
