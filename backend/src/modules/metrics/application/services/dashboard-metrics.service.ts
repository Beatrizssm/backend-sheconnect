import { Inject, Injectable } from '@nestjs/common';
import { MentorshipStatus, Role } from '@prisma/client';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { MongoService } from '../../../../infrastructure/mongo/mongo.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

type GroupMetric = {
  label: string;
  total: number;
};

export type DashboardMetrics = {
  users: {
    total: number;
    entrepreneurs: number;
    mentors: number;
    investors: number;
    admins: number;
    recentRegistrations: number;
  };
  startups: {
    total: number;
    byCategory: GroupMetric[];
    byStage: GroupMetric[];
  };
  mentorships: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  };
  events: {
    total: number;
    upcoming: number;
    online: number;
    inPerson: number;
    byCategory: GroupMetric[];
  };
  notifications: {
    total: number;
    unread: number;
    read: number;
  };
  chat: {
    totalMessages: number;
    activeConversations: number;
  };
  audit: {
    totalLogs: number;
    todayLogs: number;
  };
};

@Injectable()
export class DashboardMetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongo: MongoService,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async getDashboard(userId: string): Promise<DashboardMetrics> {
    const [users, startups, mentorships, events, notifications, chat, audit] = await Promise.all([
      this.getUserMetrics(),
      this.getStartupMetrics(),
      this.getMentorshipMetrics(),
      this.getEventMetrics(),
      this.getNotificationMetrics(),
      this.getChatMetrics(),
      this.getAuditMetrics(),
    ]);

    await this.auditLogger.log({
      action: 'DASHBOARD_METRICS_VIEWED',
      entity: 'Dashboard',
      userId,
      afterData: {
        viewedAt: new Date().toISOString(),
      },
    });

    return {
      users,
      startups,
      mentorships,
      events,
      notifications,
      chat,
      audit,
    };
  }

  private async getUserMetrics(): Promise<DashboardMetrics['users']> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [total, byRole, recentRegistrations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);
    const roleCounts = new Map(byRole.map((item) => [item.role, item._count._all]));

    return {
      total,
      entrepreneurs: roleCounts.get(Role.ENTREPRENEUR) ?? 0,
      mentors: roleCounts.get(Role.MENTOR) ?? 0,
      investors: roleCounts.get(Role.INVESTOR) ?? 0,
      admins: roleCounts.get(Role.ADMIN) ?? 0,
      recentRegistrations,
    };
  }

  private async getStartupMetrics(): Promise<DashboardMetrics['startups']> {
    const [total, byCategory, byStage] = await Promise.all([
      this.prisma.startup.count(),
      this.prisma.startup.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { category: 'asc' },
      }),
      this.prisma.startup.groupBy({
        by: ['stage'],
        _count: { _all: true },
        orderBy: { stage: 'asc' },
      }),
    ]);

    return {
      total,
      byCategory: byCategory.map((item) => ({ label: item.category, total: item._count._all })),
      byStage: byStage.map((item) => ({ label: item.stage, total: item._count._all })),
    };
  }

  private async getMentorshipMetrics(): Promise<DashboardMetrics['mentorships']> {
    const [total, byStatus] = await Promise.all([
      this.prisma.mentorship.count(),
      this.prisma.mentorship.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);
    const statusCounts = new Map(byStatus.map((item) => [item.status, item._count._all]));
    const completed = statusCounts.get(MentorshipStatus.CONCLUIDA) ?? 0;
    const pending =
      (statusCounts.get(MentorshipStatus.SOLICITADA) ?? 0) +
      (statusCounts.get(MentorshipStatus.EM_ANALISE) ?? 0);
    const accepted =
      (statusCounts.get(MentorshipStatus.ACEITA) ?? 0) +
      (statusCounts.get(MentorshipStatus.AGENDADA) ?? 0) +
      (statusCounts.get(MentorshipStatus.EM_ANDAMENTO) ?? 0);

    return {
      total,
      pending,
      accepted,
      rejected: statusCounts.get(MentorshipStatus.REJEITADA) ?? 0,
      completed,
      cancelled: statusCounts.get(MentorshipStatus.CANCELADA) ?? 0,
      completionRate: total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0,
    };
  }

  private async getEventMetrics(): Promise<DashboardMetrics['events']> {
    const now = new Date();
    const [total, upcoming, online, byCategory] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({
        where: {
          eventDate: {
            gt: now,
          },
        },
      }),
      this.prisma.event.count({ where: { isOnline: true } }),
      this.prisma.event.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { category: 'asc' },
      }),
    ]);

    return {
      total,
      upcoming,
      online,
      inPerson: total - online,
      byCategory: byCategory.map((item) => ({ label: item.category, total: item._count._all })),
    };
  }

  private async getNotificationMetrics(): Promise<DashboardMetrics['notifications']> {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
    };
  }

  private async getChatMetrics(): Promise<DashboardMetrics['chat']> {
    const [result] = await this.mongo.chatMessages
      .aggregate<{
        totalMessages: Array<{ count: number }>;
        activeConversations: Array<{ count: number }>;
      }>([
        {
          $facet: {
            totalMessages: [{ $count: 'count' }],
            activeConversations: [{ $group: { _id: '$conversationId' } }, { $count: 'count' }],
          },
        },
      ])
      .toArray();

    return {
      totalMessages: result?.totalMessages[0]?.count ?? 0,
      activeConversations: result?.activeConversations[0]?.count ?? 0,
    };
  }

  private async getAuditMetrics(): Promise<DashboardMetrics['audit']> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [totalLogs, todayLogs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
    };
  }
}
