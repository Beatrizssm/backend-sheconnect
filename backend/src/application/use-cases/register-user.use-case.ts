import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../ports/event-bus.port';
import { UserEntity } from '../../domains/user/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domains/user/repositories/user.repository.port';
import { PasswordHasher } from '../../shared/utils/password-hasher';
import { Role } from '../../domains/user/enums/role.enum';

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserEntity['role'];
};

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserEntity> {
    const existingUser = await this.users.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    const password = await PasswordHasher.hash(input.password);
    const user = UserEntity.create({ ...input, role: Role.ENTREPRENEUR, password });

    const createdUser = await this.users.create(user);

    await this.auditLogger.log({
      action: 'USER_REGISTERED',
      userId: createdUser.id,
      entity: 'User',
      entityId: createdUser.id,
      afterData: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
      },
    });
    await this.eventBus.publish('USER_REGISTERED', {
      userId: createdUser.id,
      entityId: createdUser.id,
      payload: {
        email: createdUser.email,
        role: createdUser.role,
      },
    });

    return createdUser;
  }
}
