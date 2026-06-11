import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { DASHBOARD_REPOSITORY } from './application/ports/dashboard.repository';
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.use-case';
import { DashboardController } from './infrastructure/dashboard.controller';
import { PrismaDashboardRepository } from './infrastructure/prisma-dashboard.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [
    GetAdminDashboardUseCase,
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: PrismaDashboardRepository,
    },
  ],
})
export class DashboardModule {}
