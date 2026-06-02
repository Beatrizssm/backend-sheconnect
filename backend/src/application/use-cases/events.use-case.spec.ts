import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuditLoggerPort } from '../ports/audit-log.port';
import { EventBusPort } from '../ports/event-bus.port';
import { Role } from '../../domains/user/enums/role.enum';
import { CreateEventUseCase } from '../../modules/events/application/use-cases/create-event/create-event.use-case';
import { GetEventUseCase } from '../../modules/events/application/use-cases/get-event/get-event.use-case';
import { RegisterEventUseCase } from '../../modules/events/application/use-cases/register-event/register-event.use-case';
import { UnregisterEventUseCase } from '../../modules/events/application/use-cases/unregister-event/unregister-event.use-case';
import { UpdateEventUseCase } from '../../modules/events/application/use-cases/update-event/update-event.use-case';
import { EventRegistrationEntity } from '../../modules/events/domain/entities/event-registration.entity';
import { EventEntity } from '../../modules/events/domain/entities/event.entity';
import { EventRepository } from '../../modules/events/domain/repositories/event.repository';

describe('Events use cases', () => {
  const events = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findRegistration: jest.fn(),
    countRegistrations: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn(),
  } satisfies jest.Mocked<EventRepository>;
  const auditLogger = {
    log: jest.fn(),
  } satisfies jest.Mocked<AuditLoggerPort>;
  const eventBus = {
    publish: jest.fn(),
    registerConsumer: jest.fn(),
  } satisfies jest.Mocked<EventBusPort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a mentor to create an event', async () => {
    events.create.mockImplementation(async (event) => event);
    const useCase = new CreateEventUseCase(events, auditLogger, eventBus);
    const eventDate = getFutureDate();

    const event = await useCase.execute({
      title: 'Pitch para mulheres',
      description: 'Evento de preparação para pitch.',
      category: 'Pitch',
      isOnline: true,
      meetingLink: 'https://meet.example.com/pitch',
      eventDate,
      maxAttendees: 30,
      organizerId: 'mentor-id',
      organizerRole: Role.MENTOR,
    });

    expect(event.title).toBe('Pitch para mulheres');
    expect(event.organizerId).toBe('mentor-id');
    expect(events.create).toHaveBeenCalledWith(expect.any(EventEntity));
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'EVENT_CREATED',
      userId: 'mentor-id',
      entity: 'Event',
      entityId: event.id,
      afterData: expect.objectContaining({ title: 'Pitch para mulheres' }),
    }));
    expect(eventBus.publish).toHaveBeenCalledWith('EVENT_CREATED', expect.objectContaining({ entityId: event.id }));
  });

  it('prevents entrepreneurs from creating events', async () => {
    const useCase = new CreateEventUseCase(events, auditLogger, eventBus);

    await expect(
      useCase.execute({
        title: 'Evento sem permissão',
        description: 'Tentativa de criação sem permissão.',
        category: 'Growth',
        eventDate: getFutureDate(),
        organizerId: 'entrepreneur-id',
        organizerRole: Role.ENTREPRENEUR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents a mentor from updating another organizer event', async () => {
    const event = createEvent({ organizerId: 'organizer-id' });
    events.findById.mockResolvedValue(event);
    const useCase = new UpdateEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(
      useCase.execute({
        id: event.id,
        userId: 'another-mentor-id',
        userRole: Role.MENTOR,
        title: 'Atualização inválida',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('registers a user for an upcoming event', async () => {
    const event = createEvent({ maxAttendees: 2 });
    const registration = EventRegistrationEntity.create({
      id: 'registration-id',
      eventId: event.id,
      userId: 'user-id',
    });
    events.findById.mockResolvedValue(event);
    events.findRegistration.mockResolvedValue(null);
    events.countRegistrations.mockResolvedValue(1);
    events.register.mockResolvedValue(registration);
    const useCase = new RegisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).resolves.toBe(registration);
    expect(events.register).toHaveBeenCalledWith(event.id, 'user-id');
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'EVENT_REGISTERED',
      userId: 'user-id',
      entity: 'Event',
      entityId: event.id,
      afterData: expect.objectContaining({
        eventId: event.id,
        registrationId: registration.id,
      }),
    }));
    expect(eventBus.publish).toHaveBeenCalledWith(
      'EVENT_REGISTERED',
      expect.objectContaining({
        userId: 'user-id',
        payload: expect.objectContaining({ organizerId: event.organizerId }),
      }),
    );
  });

  it('prevents duplicate event registration', async () => {
    const event = createEvent();
    events.findById.mockResolvedValue(event);
    events.findRegistration.mockResolvedValue(
      EventRegistrationEntity.create({
        eventId: event.id,
        userId: 'user-id',
      }),
    );
    const useCase = new RegisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents registration when max attendees is reached', async () => {
    const event = createEvent({ maxAttendees: 1 });
    events.findById.mockResolvedValue(event);
    events.findRegistration.mockResolvedValue(null);
    events.countRegistrations.mockResolvedValue(1);
    const useCase = new RegisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents registration for past events', async () => {
    const event = createEvent({ eventDate: getPastDate() });
    events.findById.mockResolvedValue(event);
    const useCase = new RegisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('unregisters a user from an event', async () => {
    const event = createEvent();
    events.findById.mockResolvedValue(event);
    events.unregister.mockResolvedValue(true);
    const useCase = new UnregisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).resolves.toBeUndefined();
    expect(events.unregister).toHaveBeenCalledWith(event.id, 'user-id');
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'EVENT_UNREGISTERED',
      userId: 'user-id',
      entity: 'Event',
      entityId: event.id,
      beforeData: expect.objectContaining({
        eventId: event.id,
        attendeeId: 'user-id',
      }),
    }));
  });

  it('fails when cancelling a missing registration', async () => {
    const event = createEvent();
    events.findById.mockResolvedValue(event);
    events.unregister.mockResolvedValue(false);
    const useCase = new UnregisterEventUseCase(events, new GetEventUseCase(events), auditLogger, eventBus);

    await expect(useCase.execute({ eventId: event.id, userId: 'user-id' })).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createEvent(overrides: Partial<Parameters<typeof EventEntity.create>[0]> = {}): EventEntity {
  return EventEntity.create({
    id: 'event-id',
    title: 'SheConnect Summit',
    description: 'Evento corporativo para networking.',
    category: 'Networking',
    eventDate: getFutureDate(),
    organizerId: 'organizer-id',
    ...overrides,
  });
}

function getFutureDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

function getPastDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}
