import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../../domains/user/enums/role.enum';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateEventUseCase } from '../../application/use-cases/create-event/create-event.use-case';
import { DeleteEventUseCase } from '../../application/use-cases/delete-event/delete-event.use-case';
import { GetEventUseCase } from '../../application/use-cases/get-event/get-event.use-case';
import { ListEventsUseCase } from '../../application/use-cases/list-events/list-events.use-case';
import { RegisterEventUseCase } from '../../application/use-cases/register-event/register-event.use-case';
import { UnregisterEventUseCase } from '../../application/use-cases/unregister-event/unregister-event.use-case';
import { UpdateEventUseCase } from '../../application/use-cases/update-event/update-event.use-case';
import { CreateEventDto } from '../dto/create-event.dto';
import { ListEventsQueryDto } from '../dto/list-events-query.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventMapper, EventRegistrationMapper } from '../mappers/event.mapper';

@UseGuards(JwtGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEvent: CreateEventUseCase,
    private readonly listEvents: ListEventsUseCase,
    private readonly getEvent: GetEventUseCase,
    private readonly updateEvent: UpdateEventUseCase,
    private readonly deleteEvent: DeleteEventUseCase,
    private readonly registerEvent: RegisterEventUseCase,
    private readonly unregisterEvent: UnregisterEventUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MENTOR)
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthenticatedUser) {
    const event = await this.createEvent.execute({
      ...dto,
      eventDate: new Date(dto.eventDate),
      organizerId: user.id,
      organizerRole: user.role,
    });

    return EventMapper.toResponse(event);
  }

  @Get()
  async list(@Query() query: ListEventsQueryDto) {
    const result = await this.listEvents.execute({
      category: query.category,
      isOnline: query.isOnline,
      date: query.date ? new Date(query.date) : undefined,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map(EventMapper.toResponse),
      meta: result.meta,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const event = await this.getEvent.execute(id);
    return EventMapper.toResponse(event);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MENTOR)
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @CurrentUser() user: AuthenticatedUser) {
    const event = await this.updateEvent.execute({
      ...dto,
      id,
      userId: user.id,
      userRole: user.role,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
    });

    return EventMapper.toResponse(event);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MENTOR)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.deleteEvent.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return { message: 'Event deleted successfully.' };
  }

  @Post(':id/register')
  async register(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const registration = await this.registerEvent.execute({
      eventId: id,
      userId: user.id,
    });

    return EventRegistrationMapper.toResponse(registration);
  }

  @Delete(':id/register')
  async unregister(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.unregisterEvent.execute({
      eventId: id,
      userId: user.id,
    });

    return { message: 'Event registration cancelled successfully.' };
  }
}
