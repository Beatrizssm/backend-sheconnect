import { GetAdminDashboardUseCase } from './get-admin-dashboard.use-case';

describe('GetAdminDashboardUseCase', () => {
  it('returns admin dashboard data from repository', async () => {
    const dashboard = {
      kpis: {
        totalUsers: 50,
        totalEntrepreneurs: 25,
        totalMentors: 15,
        totalInvestors: 8,
        totalStartups: 20,
        mentorshipsCompleted: 8,
        mentorshipsPending: 8,
        activeEvents: 15,
        networkingConnections: 10,
        monthlyGrowth: 12,
      },
      analytics: {
        startupsByCategory: [],
        mentorshipsByMonth: [],
        usersByRole: [],
        startupGrowth: [],
      },
      users: [],
    };
    const repository = { getAdminDashboard: jest.fn().mockResolvedValue(dashboard) };
    const useCase = new GetAdminDashboardUseCase(repository);

    await expect(useCase.execute()).resolves.toBe(dashboard);
    expect(repository.getAdminDashboard).toHaveBeenCalledTimes(1);
  });
});
