import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { StartupEntity } from '../../../domain/entities/startup.entity';
import {
  STARTUP_REPOSITORY,
  StartupRepository,
} from '../../../domain/repositories/startup.repository';

export type CreateStartupInput = {
  founderId: string;
  founderRole: Role;
  name: string;
  description: string;
  category: string;
  stage: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  pitch?: string;
};

@Injectable()
export class CreateStartupUseCase {
  constructor(
    @Inject(STARTUP_REPOSITORY)
    private readonly startups: StartupRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: CreateStartupInput): Promise<StartupEntity> {
    if (input.founderRole !== Role.ENTREPRENEUR) {
      throw new ForbiddenException('Only entrepreneurs can create startups.');
    }

    const startup = StartupEntity.create({
      founderId: input.founderId,
      name: input.name,
      description: input.description,
      category: input.category,
      stage: input.stage,
      website: input.website,
      linkedin: input.linkedin,
      instagram: input.instagram,
      pitch: input.pitch,
    });

    const createdStartup = await this.startups.create(startup);
    const afterData = createdStartup.toPrimitives();

    await this.auditLogger.log({
      action: 'STARTUP_CREATED',
      entity: 'Startup',
      entityId: createdStartup.id,
      userId: input.founderId,
      afterData,
    });

    await this.eventBus?.publish('STARTUP_CREATED', {
      userId: input.founderId,
      entityId: createdStartup.id,
      payload: afterData,
    });

    return createdStartup;
  }
}
