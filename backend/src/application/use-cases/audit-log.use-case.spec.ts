import { PrismaAuditLoggerService } from '../../infrastructure/audit/prisma-audit-logger.service';
import { AuditLogsController } from '../../infrastructure/audit/audit-logs.controller';
import { AuditLogQueryService } from '../../infrastructure/audit/audit-log-query.service';
import { ROLES_KEY } from '../../modules/auth/roles.decorator';
import { Role } from '../../domains/user/enums/role.enum';

describe('Enterprise audit logs', () => {
  it('creates an audit log with before and after data', async () => {
    const prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new PrismaAuditLoggerService(prisma as never);

    await service.log({
      action: 'STARTUP_UPDATED',
      entity: 'Startup',
      entityId: 'startup-id',
      userId: 'user-id',
      beforeData: { name: 'Old name' },
      afterData: { name: 'New name' },
      ipAddress: '127.0.0.1',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'STARTUP_UPDATED',
        entity: 'Startup',
        entityId: 'startup-id',
        userId: 'user-id',
        beforeData: { name: 'Old name' },
        afterData: { name: 'New name' },
        oldValue: { name: 'Old name' },
        newValue: { name: 'New name' },
        ipAddress: '127.0.0.1',
        userAgent: undefined,
      },
    });
  });

  it('does not persist undefined optional audit fields', async () => {
    const prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new PrismaAuditLoggerService(prisma as never);

    await service.log({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: 'user-id',
      userId: 'user-id',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        beforeData: undefined,
        afterData: undefined,
      }),
    });
  });

  it('restricts audit log endpoints to admins', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, AuditLogsController);
    expect(roles).toEqual([Role.ADMIN]);
  });

  it('delegates list filters to the audit query service', async () => {
    const auditLogs = {
      findMany: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      findById: jest.fn(),
    } as unknown as jest.Mocked<AuditLogQueryService>;
    const controller = new AuditLogsController(auditLogs);

    await controller.list({
      action: 'EVENT_REGISTERED',
      entity: 'Event',
      userId: 'user-id',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.999Z',
      page: 2,
      limit: 10,
    });

    expect(auditLogs.findMany).toHaveBeenCalledWith({
      action: 'EVENT_REGISTERED',
      entity: 'Event',
      userId: 'user-id',
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-05-31T23:59:59.999Z'),
      page: 2,
      limit: 10,
    });
  });
});
