import { EventEntity, UpdateEventProps } from '../entities/event.entity';
import { EventRegistrationEntity } from '../entities/event-registration.entity';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export type EventListFilters = {
  category?: string;
  isOnline?: boolean;
  date?: Date;
  page: number;
  limit: number;
};

export type PaginatedEvents = {
  data: EventEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface EventRepository {
  create(event: EventEntity): Promise<EventEntity>;
  findById(id: string): Promise<EventEntity | null>;
  findMany(filters: EventListFilters): Promise<PaginatedEvents>;
  update(id: string, data: UpdateEventProps): Promise<EventEntity>;
  delete(id: string): Promise<void>;
  findRegistration(eventId: string, userId: string): Promise<EventRegistrationEntity | null>;
  countRegistrations(eventId: string): Promise<number>;
  register(eventId: string, userId: string): Promise<EventRegistrationEntity>;
  unregister(eventId: string, userId: string): Promise<boolean>;
}
