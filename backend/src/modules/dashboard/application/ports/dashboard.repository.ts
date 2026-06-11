export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export type GroupMetric = {
  label: string;
  total: number;
};

export type MonthlyMetric = {
  month: string;
  total: number;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

export type AdminDashboard = {
  kpis: {
    totalUsers: number;
    totalEntrepreneurs: number;
    totalMentors: number;
    totalInvestors: number;
    totalStartups: number;
    mentorshipsCompleted: number;
    mentorshipsPending: number;
    activeEvents: number;
    networkingConnections: number;
    monthlyGrowth: number;
  };
  analytics: {
    startupsByCategory: GroupMetric[];
    mentorshipsByMonth: MonthlyMetric[];
    usersByRole: GroupMetric[];
    startupGrowth: MonthlyMetric[];
  };
  users: AdminUserSummary[];
};

export interface DashboardRepository {
  getAdminDashboard(): Promise<AdminDashboard>;
}
