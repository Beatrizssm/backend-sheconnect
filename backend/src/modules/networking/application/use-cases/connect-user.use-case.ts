import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../application/ports/event-bus.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../domains/user/repositories/user.repository.port';
import { UserConnectionEntity } from '../../domain/entities/user-connection.entity';
import { NETWORKING_REPOSITORY, NetworkingRepository } from '../../domain/repositories/networking.repository';

export type ConnectUserInput = {
  requesterId: string;
  receiverId: string;
};

@Injectable()
export class ConnectUserUseCase {
  constructor(
    @Inject(NETWORKING_REPOSITORY)
    private readonly networking: NetworkingRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: ConnectUserInput): Promise<UserConnectionEntity> {
    if (input.requesterId === input.receiverId) {
      throw new BadRequestException('You cannot connect with yourself.');
    }

    const receiver = await this.users.findById(input.receiverId);
    if (!receiver) {
      throw new NotFoundException('Connection target user not found.');
    }

    const existing = await this.networking.findConnectionBetweenUsers(input.requesterId, input.receiverId);
    if (existing) {
      throw new ConflictException('A connection request already exists between these users.');
    }

    const connection = await this.networking.create(
      UserConnectionEntity.create({
        requesterId: input.requesterId,
        receiverId: input.receiverId,
      }),
    );

    await this.auditLogger.log({
      action: 'CREATE',
      entity: 'UserConnection',
      entityId: connection.id,
      userId: input.requesterId,
      afterData: connection.toPrimitives(),
    });
    await this.eventBus?.publish('USER_CONNECTED', {
      userId: input.requesterId,
      entityId: connection.id,
      payload: connection.toPrimitives(),
    });

    return connection;
  }
}
