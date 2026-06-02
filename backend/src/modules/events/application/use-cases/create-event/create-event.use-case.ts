import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { EventEntity } from '../../../domain/entities/event.entity';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';

export type CreateEventInput = {
  title: string;
  description: string;
  category: string;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  eventDate: Date;
  maxAttendees?: number;
  organizerId: string;
  organizerRole: Role;
};

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly events: EventRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: CreateEventInput): Promise<EventEntity> {
    if (![Role.ADMIN, Role.MENTOR].includes(input.organizerRole)) {
      throw new ForbiddenException('Only mentors or admins can create events.');
    }

    const event = EventEntity.create({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      isOnline: input.isOnline,
      meetingLink: input.meetingLink,
      eventDate: input.eventDate,
      maxAttendees: input.maxAttendees,
      organizerId: input.organizerId,
    });

    const createdEvent = await this.events.create(event);

    await this.auditLogger.log({
      action: 'EVENT_CREATED',
      userId: input.organizerId,
      entity: 'Event',
      entityId: createdEvent.id,
      afterData: createdEvent.toPrimitives(),
    });
    await this.eventBus?.publish('EVENT_CREATED', {
      userId: input.organizerId,
      entityId: createdEvent.id,
      payload: createdEvent.toPrimitives(),
    });

    return createdEvent;
  }
}
