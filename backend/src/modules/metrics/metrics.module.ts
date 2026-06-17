import { Module } from '@nestjs/common';
import { AuditLoggerModule } from '../../infrastructure/audit/audit-logger.module';
import { PersistenceModule } from '../persistence.module';
import { DashboardMetricsService } from './application/services/dashboard-metrics.service';
import { EnterpriseMetricsController } from './infrastructure/controllers/metrics.controller';

@Module({
  imports: [PersistenceModule, AuditLoggerModule],
  controllers: [EnterpriseMetricsController],
  providers: [DashboardMetricsService],
})
export class MetricsModule {}
