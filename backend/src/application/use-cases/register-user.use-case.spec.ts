import { ConflictException } from '@nestjs/common';
import { AuditLoggerPort } from '../ports/audit-log.port';
import { EventBusPort } from '../ports/event-bus.port';
import { Role } from '../../domains/user/enums/role.enum';
import { UserRepositoryPort } from '../../domains/user/repositories/user.repository.port';
import { RegisterUserUseCase } from './register-user.use-case';

describe(RegisterUserUseCase.name, () => {
  const users = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  } satisfies jest.Mocked<UserRepositoryPort>;
  const eventBus = {
    publish: jest.fn(),
    registerConsumer: jest.fn().mockResolvedValue(undefined),
  } satisfies jest.Mocked<EventBusPort>;
  const auditLogger = { log: jest.fn() } satisfies jest.Mocked<AuditLoggerPort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with hashed password and emits side effects', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockImplementation(async (user) => user);

    const useCase = new RegisterUserUseCase(users, eventBus, auditLogger);
    const user = await useCase.execute({
      name: 'Beatriz Souza',
      email: 'BEATRIZ@EMAIL.COM',
      password: 'Senha123',
      role: Role.ENTREPRENEUR,
    });

    expect(user.email).toBe('beatriz@email.com');
    expect(user.password).not.toBe('Senha123');
    expect(auditLogger.log).toHaveBeenCalledWith({
      action: 'USER_REGISTERED',
      userId: user.id,
      entity: 'User',
      entityId: user.id,
      afterData: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
    expect(eventBus.publish).toHaveBeenCalledWith('USER_REGISTERED', {
      userId: user.id,
      entityId: user.id,
      payload: {
        email: user.email,
        role: user.role,
      },
    });
  });

  it('throws when email is already registered', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'Beatriz',
      email: 'beatriz@email.com',
      password: 'hashed',
      role: Role.ENTREPRENEUR,
      createdAt: new Date(),
    } as never);

    const useCase = new RegisterUserUseCase(users, eventBus, auditLogger);

    await expect(
      useCase.execute({
        name: 'Beatriz Souza',
        email: 'beatriz@email.com',
        password: 'Senha123',
        role: Role.ENTREPRENEUR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
