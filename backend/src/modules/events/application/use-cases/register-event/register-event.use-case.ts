import { BadRequestException, ConflictException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { EventRegistrationEntity } from '../../../domain/entities/event-registration.entity';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';
import { GetEventUseCase } from '../get-event/get-event.use-case';

export type RegisterEventInput = {
  eventId: string;
  userId: string;
};

@Injectable()
export class RegisterEventUseCase {
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

  async execute(input: RegisterEventInput): Promise<EventRegistrationEntity> {
    const event = await this.getEvent.execute(input.eventId);

    if (event.eventDate < new Date()) {
      throw new BadRequestException('You cannot register for a past event.');
    }

    const existingRegistration = await this.events.findRegistration(event.id, input.userId);
    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event.');
    }

    const registrationsCount = await this.events.countRegistrations(event.id);
    if (event.maxAttendees !== null && registrationsCount >= event.maxAttendees) {
      throw new BadRequestException('This event reached the maximum number of attendees.');
    }

    const registration = await this.events.register(event.id, input.userId);

    await this.auditLogger.log({
      action: 'EVENT_REGISTERED',
      userId: input.userId,
      entity: 'Event',
      entityId: event.id,
      afterData: {
        eventId: event.id,
        eventTitle: event.title,
        organizerId: event.organizerId,
        attendeeId: input.userId,
        registrationId: registration.id,
      },
    });
    await this.eventBus?.publish('EVENT_REGISTERED', {
      userId: input.userId,
      entityId: event.id,
      payload: {
        eventId: event.id,
        eventTitle: event.title,
        organizerId: event.organizerId,
        attendeeId: input.userId,
        registrationId: registration.id,
      },
    });

    return registration;
  }
}
