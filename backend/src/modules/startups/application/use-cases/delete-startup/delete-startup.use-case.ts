import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import {
  STARTUP_REPOSITORY,
  StartupRepository,
} from '../../../domain/repositories/startup.repository';
import { GetStartupUseCase } from '../get-startup/get-startup.use-case';

export type DeleteStartupInput = {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class DeleteStartupUseCase {
  constructor(
    @Inject(STARTUP_REPOSITORY)
    private readonly startups: StartupRepository,
    private readonly getStartup: GetStartupUseCase,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: DeleteStartupInput): Promise<void> {
    const startup = await this.getStartup.execute(input.id);

    if (input.userRole !== Role.ADMIN && startup.founderId !== input.userId) {
      throw new ForbiddenException('Only the founder or an admin can delete this startup.');
    }

    await this.startups.delete(startup.id);
    const beforeData = startup.toPrimitives();

    await this.auditLogger.log({
      action: 'STARTUP_DELETED',
      entity: 'Startup',
      entityId: startup.id,
      userId: input.userId,
      beforeData,
    });

    await this.eventBus?.publish('STARTUP_DELETED', {
      userId: input.userId,
      entityId: startup.id,
      payload: beforeData,
    });
  }
}
