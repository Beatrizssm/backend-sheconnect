import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUDIT_LOGGER, AuditLoggerPort } from '../ports/audit-log.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domains/user/repositories/user.repository.port';
import { PasswordHasher } from '../../shared/utils/password-hasher';
import { UserEntity } from '../../domains/user/entities/user.entity';

type LoginInput = {
  email: string;
  password: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    private readonly jwtService: JwtService,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(input: LoginInput): Promise<{
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserEntity['role'];
      createdAt: Date;
    };
  }> {
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await PasswordHasher.compare(input.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    await this.auditLogger.log({
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

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
