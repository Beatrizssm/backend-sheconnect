import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuditLoggerPort } from '../ports/audit-log.port';
import { UserEntity } from '../../domains/user/entities/user.entity';
import { Role } from '../../domains/user/enums/role.enum';
import { UserRepositoryPort } from '../../domains/user/repositories/user.repository.port';
import { PasswordHasher } from '../../shared/utils/password-hasher';
import { LoginUseCase } from './login.use-case';

describe(LoginUseCase.name, () => {
  const users = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  } satisfies jest.Mocked<UserRepositoryPort>;
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
  const auditLogger = {
    log: jest.fn(),
  } satisfies jest.Mocked<AuditLoggerPort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a JWT when credentials are valid', async () => {
    const password = await PasswordHasher.hash('Senha123');
    const user = UserEntity.create({
      name: 'Beatriz',
      email: 'beatriz@email.com',
      password,
      role: Role.ENTREPRENEUR,
    });
    users.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const useCase = new LoginUseCase(users, jwtService, auditLogger);
    await expect(useCase.execute({ email: user.email, password: 'Senha123' })).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    expect(auditLogger.log).toHaveBeenCalledWith({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
      afterData: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });

  it('throws when user does not exist', async () => {
    users.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUseCase(users, jwtService, auditLogger);

    await expect(
      useCase.execute({ email: 'notfound@email.com', password: 'Senha123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when password is invalid', async () => {
    const user = UserEntity.create({
      name: 'Beatriz',
      email: 'beatriz@email.com',
      password: await PasswordHasher.hash('Senha123'),
      role: Role.ENTREPRENEUR,
    });
    users.findByEmail.mockResolvedValue(user);
    const useCase = new LoginUseCase(users, jwtService, auditLogger);

    await expect(
      useCase.execute({ email: user.email, password: 'SenhaErrada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
