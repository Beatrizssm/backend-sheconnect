import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { StartupEntity, UpdateStartupProps } from '../../../domain/entities/startup.entity';
import {
  STARTUP_REPOSITORY,
  StartupRepository,
} from '../../../domain/repositories/startup.repository';
import { GetStartupUseCase } from '../get-startup/get-startup.use-case';

export type UpdateStartupInput = UpdateStartupProps & {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class UpdateStartupUseCase {
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

  async execute(input: UpdateStartupInput): Promise<StartupEntity> {
    const startup = await this.getStartup.execute(input.id);

    if (input.userRole !== Role.ADMIN && startup.founderId !== input.userId) {
      throw new ForbiddenException('Only the founder or an admin can update this startup.');
    }

    const data: UpdateStartupProps = {
      name: input.name,
      description: input.description,
      category: input.category,
      stage: input.stage,
      website: input.website,
      linkedin: input.linkedin,
      instagram: input.instagram,
      pitch: input.pitch,
    };

    const updatedStartup = await this.startups.update(startup.id, data);
    const beforeData = startup.toPrimitives();
    const afterData = updatedStartup.toPrimitives();

    await this.auditLogger.log({
      action: 'STARTUP_UPDATED',
      entity: 'Startup',
      entityId: updatedStartup.id,
      userId: input.userId,
      beforeData,
      afterData,
    });

    await this.eventBus?.publish('STARTUP_UPDATED', {
      userId: input.userId,
      entityId: updatedStartup.id,
      payload: afterData,
    });

    return updatedStartup;
  }
}
