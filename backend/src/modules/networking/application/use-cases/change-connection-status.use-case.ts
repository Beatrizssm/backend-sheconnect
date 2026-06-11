import { ForbiddenException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../application/ports/event-bus.port';
import { UserConnectionEntity, UserConnectionStatus } from '../../domain/entities/user-connection.entity';
import { NETWORKING_REPOSITORY, NetworkingRepository } from '../../domain/repositories/networking.repository';

export type ChangeConnectionStatusInput = {
  id: string;
  userId: string;
  status: UserConnectionStatus.ACCEPTED | UserConnectionStatus.REJECTED;
};

@Injectable()
export class ChangeConnectionStatusUseCase {
  constructor(
    @Inject(NETWORKING_REPOSITORY)
    private readonly networking: NetworkingRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: ChangeConnectionStatusInput): Promise<UserConnectionEntity> {
    const connection = await this.networking.findConnectionById(input.id);
    if (!connection) {
      throw new NotFoundException('Connection request not found.');
    }

    if (connection.receiverId !== input.userId) {
      throw new ForbiddenException('Only the invited user can change this connection status.');
    }

    const updatedConnection = await this.networking.updateStatus(input.id, input.status);

    await this.auditLogger.log({
      action: 'STATUS_CHANGE',
      entity: 'UserConnection',
      entityId: updatedConnection.id,
      userId: input.userId,
      beforeData: connection.toPrimitives(),
      afterData: updatedConnection.toPrimitives(),
    });

    if (input.status === UserConnectionStatus.ACCEPTED) {
      await this.eventBus?.publish('USER_CONNECTED', {
        userId: input.userId,
        entityId: updatedConnection.id,
        payload: updatedConnection.toPrimitives(),
      });
    }

    return updatedConnection;
  }
}
