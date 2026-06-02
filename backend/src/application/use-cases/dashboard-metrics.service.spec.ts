import { DashboardMetricsService } from '../../modules/metrics/application/services/dashboard-metrics.service';
import { EnterpriseMetricsController } from '../../modules/metrics/infrastructure/controllers/metrics.controller';
import { ROLES_KEY } from '../../modules/auth/roles.decorator';
import { Role } from '../../domains/user/enums/role.enum';

describe(DashboardMetricsService.name, () => {
  const prisma = {
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    startup: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    mentorship: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    event: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    notification: {
      count: jest.fn(),
    },
    auditLog: {
      count: jest.fn(),
    },
  };
  const mongoAggregate = jest.fn();
  const mongo = {
    chatMessages: {
      aggregate: mongoAggregate,
    },
  };
  const auditLogger = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.count.mockImplementation((args?: unknown) => (args ? 3 : 10));
    prisma.user.groupBy.mockResolvedValue([
      { role: Role.ENTREPRENEUR, _count: { _all: 4 } },
      { role: Role.MENTOR, _count: { _all: 3 } },
      { role: Role.INVESTOR, _count: { _all: 2 } },
      { role: Role.ADMIN, _count: { _all: 1 } },
    ]);
    prisma.startup.count.mockResolvedValue(5);
    prisma.startup.groupBy
      .mockResolvedValueOnce([
        { category: 'Fintech', _count: { _all: 2 } },
        { category: 'Health', _count: { _all: 3 } },
      ])
      .mockResolvedValueOnce([
        { stage: 'MVP', _count: { _all: 4 } },
        { stage: 'Seed', _count: { _all: 1 } },
      ]);
    prisma.mentorship.count.mockResolvedValue(4);
    prisma.mentorship.groupBy.mockResolvedValue([
      { status: 'PENDING', _count: { _all: 1 } },
      { status: 'ACCEPTED', _count: { _all: 1 } },
      { status: 'COMPLETED', _count: { _all: 2 } },
    ]);
    prisma.event.count.mockImplementation((args?: { where?: { isOnline?: boolean; eventDate?: unknown } }) => {
      if (args?.where?.eventDate) {
        return Promise.resolve(3);
      }

      if (args?.where?.isOnline === true) {
        return Promise.resolve(2);
      }

      return Promise.resolve(6);
    });
    prisma.event.groupBy.mockResolvedValue([
      { category: 'Pitch', _count: { _all: 4 } },
      { category: 'Networking', _count: { _all: 2 } },
    ]);
    prisma.notification.count.mockImplementation((args?: { where?: { isRead?: boolean } }) =>
      Promise.resolve(args?.where?.isRead === false ? 4 : 9),
    );
    prisma.auditLog.count.mockImplementation((args?: unknown) => Promise.resolve(args ? 2 : 20));
    mongoAggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        {
          totalMessages: [{ count: 15 }],
          activeConversations: [{ count: 6 }],
        },
      ]),
    });
  });

  it('aggregates dashboard metrics from PostgreSQL and MongoDB', async () => {
    const service = new DashboardMetricsService(prisma as never, mongo as never, auditLogger as never);

    const metrics = await service.getDashboard('admin-id');

    expect(metrics.users).toEqual({
      total: 10,
      entrepreneurs: 4,
      mentors: 3,
      investors: 2,
      admins: 1,
      recentRegistrations: 3,
    });
    expect(metrics.startups.byCategory).toEqual([
      { label: 'Fintech', total: 2 },
      { label: 'Health', total: 3 },
    ]);
    expect(metrics.notifications).toEqual({ total: 9, unread: 4, read: 5 });
    expect(metrics.chat).toEqual({ totalMessages: 15, activeConversations: 6 });
    expect(metrics.audit).toEqual({ totalLogs: 20, todayLogs: 2 });
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DASHBOARD_METRICS_VIEWED',
        entity: 'Dashboard',
        userId: 'admin-id',
      }),
    );
  });

  it('calculates mentorship completion rate', async () => {
    const service = new DashboardMetricsService(prisma as never, mongo as never, auditLogger as never);

    const metrics = await service.getDashboard('mentor-id');

    expect(metrics.mentorships).toMatchObject({
      total: 4,
      pending: 1,
      accepted: 1,
      rejected: 0,
      completed: 2,
      cancelled: 0,
      completionRate: 50,
    });
  });

  it('uses upcoming event filter with eventDate greater than now', async () => {
    const service = new DashboardMetricsService(prisma as never, mongo as never, auditLogger as never);

    await service.getDashboard('admin-id');

    expect(prisma.event.count).toHaveBeenCalledWith({
      where: {
        eventDate: {
          gt: expect.any(Date),
        },
      },
    });
  });

  it('uses MongoDB aggregate for chat metrics', async () => {
    const service = new DashboardMetricsService(prisma as never, mongo as never, auditLogger as never);

    await service.getDashboard('admin-id');

    expect(mongoAggregate).toHaveBeenCalledWith([
      {
        $facet: {
          totalMessages: [{ $count: 'count' }],
          activeConversations: [{ $group: { _id: '$conversationId' } }, { $count: 'count' }],
        },
      },
    ]);
  });

  it('allows only admins and mentors on the dashboard endpoint', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, EnterpriseMetricsController);
    expect(roles).toEqual([Role.ADMIN, Role.MENTOR]);
  });
});
