import { Module } from '@nestjs/common';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PersistenceModule } from '../persistence.module';
import { CreateEventUseCase } from './application/use-cases/create-event/create-event.use-case';
import { DeleteEventUseCase } from './application/use-cases/delete-event/delete-event.use-case';
import { GetEventUseCase } from './application/use-cases/get-event/get-event.use-case';
import { ListEventsUseCase } from './application/use-cases/list-events/list-events.use-case';
import { RegisterEventUseCase } from './application/use-cases/register-event/register-event.use-case';
import { UnregisterEventUseCase } from './application/use-cases/unregister-event/unregister-event.use-case';
import { UpdateEventUseCase } from './application/use-cases/update-event/update-event.use-case';
import { EVENT_REPOSITORY } from './domain/repositories/event.repository';
import { EventsController } from './infrastructure/controllers/events.controller';
import { PrismaEventRepository } from './infrastructure/prisma/prisma-event.repository';

@Module({
  imports: [PersistenceModule, AuditModule],
  controllers: [EventsController],
  providers: [
    CreateEventUseCase,
    ListEventsUseCase,
    GetEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    RegisterEventUseCase,
    UnregisterEventUseCase,
    {
      provide: EVENT_REPOSITORY,
      useClass: PrismaEventRepository,
    },
  ],
})
export class EventsModule {}
