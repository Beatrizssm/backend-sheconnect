import { api } from '../../../../shared/infrastructure/api/client';
import type { AdminDashboard } from '../../domain/dashboard.types';

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboard> {
    const { data } = await api.get<AdminDashboard>('/dashboard/admin');
    return data;
  },
};
