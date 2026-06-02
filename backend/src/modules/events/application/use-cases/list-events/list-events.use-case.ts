import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  EventListFilters,
  EventRepository,
  PaginatedEvents,
} from '../../../domain/repositories/event.repository';

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly events: EventRepository,
  ) {}

  execute(filters: EventListFilters): Promise<PaginatedEvents> {
    return this.events.findMany(filters);
  }
}
