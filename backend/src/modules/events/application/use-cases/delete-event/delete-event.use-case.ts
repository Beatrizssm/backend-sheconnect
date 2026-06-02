import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { EventEntity } from '../../../domain/entities/event.entity';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';
import { GetEventUseCase } from '../get-event/get-event.use-case';

export type DeleteEventInput = {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class DeleteEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly events: EventRepository,
    private readonly getEvent: GetEventUseCase,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: DeleteEventInput): Promise<void> {
    const event = await this.getEvent.execute(input.id);
    this.ensureCanManageEvent(event, input.userId, input.userRole);

    await this.events.delete(event.id);

    await this.auditLogger.log({
      action: 'EVENT_DELETED',
      userId: input.userId,
      entity: 'Event',
      entityId: event.id,
      beforeData: event.toPrimitives(),
    });
    await this.eventBus?.publish('EVENT_DELETED', {
      userId: input.userId,
      entityId: event.id,
      payload: event.toPrimitives(),
    });
  }

  private ensureCanManageEvent(event: EventEntity, userId: string, userRole: Role): void {
    if (userRole === Role.ADMIN || event.organizerId === userId) {
      return;
    }

    throw new ForbiddenException('Only the organizer or an admin can delete this event.');
  }
}
