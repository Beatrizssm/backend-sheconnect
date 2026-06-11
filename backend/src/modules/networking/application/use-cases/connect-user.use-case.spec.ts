import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../../../../domains/user/enums/role.enum';
import { ConnectUserUseCase } from './connect-user.use-case';

describe('ConnectUserUseCase', () => {
  const buildUseCase = (overrides: Partial<{
    networking: any;
    users: any;
    auditLogger: any;
    eventBus: any;
  }> = {}) => {
    const networking = {
      findConnectionBetweenUsers: jest.fn().mockResolvedValue(null),
      create: jest.fn(async (connection) => connection),
      ...overrides.networking,
    };
    const users = {
      findById: jest.fn().mockResolvedValue({
        id: 'receiver-id',
        role: Role.MENTOR,
      }),
      ...overrides.users,
    };
    const auditLogger = {
      log: jest.fn(),
      ...overrides.auditLogger,
    };
    const eventBus = {
      publish: jest.fn(),
      ...overrides.eventBus,
    };

    return {
      useCase: new ConnectUserUseCase(networking, users, auditLogger, eventBus),
      networking,
      auditLogger,
      eventBus,
    };
  };

  it('creates a pending connection request', async () => {
    const { useCase, networking, auditLogger, eventBus } = buildUseCase();

    const connection = await useCase.execute({
      requesterId: 'requester-id',
      receiverId: 'receiver-id',
    });

    expect(connection.requesterId).toBe('requester-id');
    expect(networking.create).toHaveBeenCalledTimes(1);
    expect(auditLogger.log).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith('USER_CONNECTED', expect.any(Object));
  });

  it('rejects self connections', async () => {
    const { useCase } = buildUseCase();

    await expect(useCase.execute({ requesterId: 'same-id', receiverId: 'same-id' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('requires an existing receiver', async () => {
    const { useCase } = buildUseCase({ users: { findById: jest.fn().mockResolvedValue(null) } });

    await expect(useCase.execute({ requesterId: 'requester-id', receiverId: 'missing-id' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('prevents duplicated connection requests', async () => {
    const { useCase } = buildUseCase({
      networking: {
        findConnectionBetweenUsers: jest.fn().mockResolvedValue({ id: 'existing-id' }),
      },
    });

    await expect(useCase.execute({ requesterId: 'requester-id', receiverId: 'receiver-id' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
