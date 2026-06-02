import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { EventEntity, UpdateEventProps } from '../../../domain/entities/event.entity';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';
import { GetEventUseCase } from '../get-event/get-event.use-case';

export type UpdateEventInput = UpdateEventProps & {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class UpdateEventUseCase {
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

  async execute(input: UpdateEventInput): Promise<EventEntity> {
    const event = await this.getEvent.execute(input.id);
    this.ensureCanManageEvent(event, input.userId, input.userRole);

    const data: UpdateEventProps = {
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      isOnline: input.isOnline,
      meetingLink: input.meetingLink,
      eventDate: input.eventDate,
      maxAttendees: input.maxAttendees,
    };
    const updatedEvent = await this.events.update(event.id, data);

    await this.auditLogger.log({
      action: 'EVENT_UPDATED',
      userId: input.userId,
      entity: 'Event',
      entityId: updatedEvent.id,
      beforeData: event.toPrimitives(),
      afterData: updatedEvent.toPrimitives(),
    });
    await this.eventBus?.publish('EVENT_UPDATED', {
      userId: input.userId,
      entityId: updatedEvent.id,
      payload: updatedEvent.toPrimitives(),
    });

    return updatedEvent;
  }

  private ensureCanManageEvent(event: EventEntity, userId: string, userRole: Role): void {
    if (userRole === Role.ADMIN || event.organizerId === userId) {
      return;
    }

    throw new ForbiddenException('Only the organizer or an admin can update this event.');
  }
}
