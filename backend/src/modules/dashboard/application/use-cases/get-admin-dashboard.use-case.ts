import { Inject, Injectable } from '@nestjs/common';
import {
  AdminDashboard,
  DASHBOARD_REPOSITORY,
  DashboardRepository,
} from '../ports/dashboard.repository';

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  execute(): Promise<AdminDashboard> {
    return this.dashboardRepository.getAdminDashboard();
  }
}
