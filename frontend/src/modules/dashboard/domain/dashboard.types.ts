export type DashboardMetric = {
  label?: string;
  month?: string;
  total: number;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
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
    startupsByCategory: DashboardMetric[];
    mentorshipsByMonth: DashboardMetric[];
    usersByRole: DashboardMetric[];
    startupGrowth: DashboardMetric[];
  };
  users: AdminUserSummary[];
};
