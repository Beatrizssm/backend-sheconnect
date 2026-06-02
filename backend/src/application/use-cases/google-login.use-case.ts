import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import { AUDIT_LOGGER, AuditLoggerPort } from '../ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../ports/event-bus.port';
import { UserEntity } from '../../domains/user/entities/user.entity';
import { Role } from '../../domains/user/enums/role.enum';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domains/user/repositories/user.repository.port';
import { PasswordHasher } from '../../shared/utils/password-hasher';

type GoogleLoginInput = {
  credential: string;
  role?: Role;
};

@Injectable()
export class GoogleLoginUseCase {
  private readonly googleClient = new OAuth2Client();

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(input: GoogleLoginInput): Promise<{
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserEntity['role'];
      createdAt: Date;
    };
  }> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!googleClientId) {
      throw new BadRequestException('Google login is not configured.');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: input.credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('Invalid Google account.');
    }

    const email = payload.email.toLowerCase().trim();
    let user = await this.users.findByEmail(email);

    if (!user) {
      const password = await PasswordHasher.hash(`google:${payload.sub}:${randomUUID()}`);
      user = await this.users.create(
        UserEntity.create({
          name: payload.name ?? email.split('@')[0],
          email,
          password,
          role: input.role ?? Role.ENTREPRENEUR,
        }),
      );

      await this.auditLogger.log({
        action: 'USER_REGISTERED_WITH_GOOGLE',
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
      await this.eventBus.publish('USER_REGISTERED', {
        userId: user.id,
        entityId: user.id,
        payload: {
          email: user.email,
          role: user.role,
        },
      });
    }

    await this.auditLogger.log({
      action: 'USER_GOOGLE_LOGIN',
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
