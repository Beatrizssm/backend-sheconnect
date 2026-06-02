import { Module } from '@nestjs/common';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PersistenceModule } from '../persistence.module';
import { DashboardMetricsService } from './application/services/dashboard-metrics.service';
import { EnterpriseMetricsController } from './infrastructure/controllers/metrics.controller';

@Module({
  imports: [PersistenceModule, AuditModule],
  controllers: [EnterpriseMetricsController],
  providers: [DashboardMetricsService],
})
export class MetricsModule {}
