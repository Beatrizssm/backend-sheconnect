import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { EventEntity, UpdateEventProps } from '../../domain/entities/event.entity';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity';
import {
  EventListFilters,
  EventRepository,
  PaginatedEvents,
} from '../../domain/repositories/event.repository';
import { EventMapper, EventRegistrationMapper } from '../mappers/event.mapper';

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: EventEntity): Promise<EventEntity> {
    const data = EventMapper.toPersistence(event);
    const createdEvent = await this.prisma.event.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        isOnline: data.isOnline,
        meetingLink: data.meetingLink,
        eventDate: data.eventDate,
        maxAttendees: data.maxAttendees,
        organizerId: data.organizerId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return EventMapper.toDomain(createdEvent);
  }

  async findById(id: string): Promise<EventEntity | null> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    return event ? EventMapper.toDomain(event) : null;
  }

  async findMany(filters: EventListFilters): Promise<PaginatedEvents> {
    const where: Prisma.EventWhereInput = {
      ...(filters.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {}),
      ...(typeof filters.isOnline === 'boolean' ? { isOnline: filters.isOnline } : {}),
      ...(filters.date ? { eventDate: this.getDateRangeFilter(filters.date) } : {}),
    };
    const skip = (filters.page - 1) * filters.limit;
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        orderBy: { eventDate: 'asc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map(EventMapper.toDomain),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async update(id: string, data: UpdateEventProps): Promise<EventEntity> {
    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data,
    });

    return EventMapper.toDomain(updatedEvent);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }

  async findRegistration(eventId: string, userId: string): Promise<EventRegistrationEntity | null> {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    return registration ? EventRegistrationMapper.toDomain(registration) : null;
  }

  countRegistrations(eventId: string): Promise<number> {
    return this.prisma.eventRegistration.count({ where: { eventId } });
  }

  async register(eventId: string, userId: string): Promise<EventRegistrationEntity> {
    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    });

    return EventRegistrationMapper.toDomain(registration);
  }

  async unregister(eventId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.eventRegistration.deleteMany({
      where: {
        eventId,
        userId,
      },
    });

    return result.count > 0;
  }

  private getDateRangeFilter(date: Date): Prisma.DateTimeFilter {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return {
      gte: startOfDay,
      lt: endOfDay,
    };
  }
}
