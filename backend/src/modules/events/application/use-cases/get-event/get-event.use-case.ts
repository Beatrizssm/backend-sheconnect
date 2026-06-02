import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEntity } from '../../../domain/entities/event.entity';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../../../domain/repositories/event.repository';

@Injectable()
export class GetEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly events: EventRepository,
  ) {}

  async execute(id: string): Promise<EventEntity> {
    const event = await this.events.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    return event;
  }
}
