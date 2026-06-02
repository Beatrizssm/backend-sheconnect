import { Event, EventRegistration } from '@prisma/client';
import { EventEntity } from '../../domain/entities/event.entity';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity';

export class EventMapper {
  static toDomain(event: Event): EventEntity {
    return EventEntity.create({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      isOnline: event.isOnline,
      meetingLink: event.meetingLink,
      eventDate: event.eventDate,
      maxAttendees: event.maxAttendees,
      organizerId: event.organizerId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  }

  static toPersistence(event: EventEntity) {
    return event.toPrimitives();
  }

  static toResponse(event: EventEntity) {
    return event.toPrimitives();
  }
}

export class EventRegistrationMapper {
  static toDomain(registration: EventRegistration): EventRegistrationEntity {
    return EventRegistrationEntity.create({
      id: registration.id,
      userId: registration.userId,
      eventId: registration.eventId,
      createdAt: registration.createdAt,
    });
  }

  static toResponse(registration: EventRegistrationEntity) {
    return registration.toPrimitives();
  }
}
