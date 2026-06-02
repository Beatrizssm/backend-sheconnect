import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';
import { GetEventUseCase } from '../get-event/get-event.use-case';

export type UnregisterEventInput = {
  eventId: string;
  userId: string;
};

@Injectable()
export class UnregisterEventUseCase {
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

  async execute(input: UnregisterEventInput): Promise<void> {
    const event = await this.getEvent.execute(input.eventId);
    const unregistered = await this.events.unregister(event.id, input.userId);

    if (!unregistered) {
      throw new NotFoundException('Event registration not found.');
    }

    await this.auditLogger.log({
      action: 'EVENT_UNREGISTERED',
      userId: input.userId,
      entity: 'Event',
      entityId: event.id,
      beforeData: {
        eventId: event.id,
        eventTitle: event.title,
        organizerId: event.organizerId,
        attendeeId: input.userId,
      },
    });
    await this.eventBus?.publish('EVENT_UNREGISTERED', {
      userId: input.userId,
      entityId: event.id,
      payload: {
        eventId: event.id,
        eventTitle: event.title,
        organizerId: event.organizerId,
        attendeeId: input.userId,
      },
    });
  }
}
