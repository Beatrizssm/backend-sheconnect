import { Injectable } from '@nestjs/common';
import { MentorshipStatus, Role } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AdminDashboard, DashboardRepository, MonthlyMetric } from '../application/ports/dashboard.repository';

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboard> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      usersByRole,
      totalStartups,
      startupsByCategory,
      mentorshipsCompleted,
      mentorshipsPending,
      activeEvents,
      networkingConnections,
      recentUsers,
      startupDates,
      mentorshipDates,
      users,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true }, orderBy: { role: 'asc' } }),
      this.prisma.startup.count(),
      this.prisma.startup.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { category: 'asc' } }),
      this.prisma.mentorship.count({ where: { status: MentorshipStatus.CONCLUIDA } }),
      this.prisma.mentorship.count({
        where: { status: { in: [MentorshipStatus.SOLICITADA, MentorshipStatus.EM_ANALISE] } },
      }),
      this.prisma.event.count({ where: { eventDate: { gte: now } } }),
      this.prisma.userConnection.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.startup.findMany({ select: { createdAt: true } }),
      this.prisma.mentorship.findMany({ select: { createdAt: true } }),
      this.prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const roleCounts = new Map(usersByRole.map((item) => [item.role, item._count._all]));

    return {
      kpis: {
        totalUsers,
        totalEntrepreneurs: roleCounts.get(Role.ENTREPRENEUR) ?? 0,
        totalMentors: roleCounts.get(Role.MENTOR) ?? 0,
        totalInvestors: roleCounts.get(Role.INVESTOR) ?? 0,
        totalStartups,
        mentorshipsCompleted,
        mentorshipsPending,
        activeEvents,
        networkingConnections,
        monthlyGrowth: totalUsers > 0 ? Number(((recentUsers / totalUsers) * 100).toFixed(2)) : 0,
      },
      analytics: {
        startupsByCategory: startupsByCategory.map((item) => ({ label: item.category, total: item._count._all })),
        mentorshipsByMonth: this.toMonthlyMetrics(mentorshipDates.map((item) => item.createdAt)),
        usersByRole: usersByRole.map((item) => ({ label: item.role, total: item._count._all })),
        startupGrowth: this.toMonthlyMetrics(startupDates.map((item) => item.createdAt)),
      },
      users,
    };
  }

  private toMonthlyMetrics(dates: Date[]): MonthlyMetric[] {
    const buckets = new Map<string, number>();

    for (const date of dates) {
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(month, (buckets.get(month) ?? 0) + 1);
    }

    return Array.from(buckets.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, total]) => ({ month, total }));
  }
}
